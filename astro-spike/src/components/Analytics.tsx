import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as React from "react";
import { lineChart, marimekkoChart, trendNumber } from "./google-analytics.js";

/**
 * Port of content/analytics.md.
 *
 * The original leaned on `Generators.observe` to bind each headline number to
 * the hovered point of its sparkline. Plot already sets `element.value` and
 * fires an `input` event on pointer moves, so here that becomes a listener that
 * writes to React state, and `resize()` becomes a ResizeObserver.
 */

interface Summary {
  date: Date;
  active: number;
  engagementRate: number;
  wauPerMau: number;
  engagedSessions: number;
}

type Metric = "active" | "engagementRate" | "wauPerMau" | "engagedSessions";

const CARDS: { key: Metric; label: string; percent?: boolean }[] = [
  { key: "active", label: "Rolling 28-day active users" },
  { key: "engagementRate", label: "Engagement rate", percent: true },
  { key: "wauPerMau", label: "WAU/MAU ratio", percent: true },
  { key: "engagedSessions", label: "Engaged sessions" },
];

/** Renders a Plot figure, keeps it sized, and reports pointer focus upward. */
const Figure = ({ plot, onFocus }: { plot: (width: number) => any; onFocus?: (value: unknown) => void }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const width = React.useRef(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let chart: (HTMLElement & { value?: unknown }) | null = null;
    const onInput = () => chart?.value !== undefined && onFocus?.(chart.value);
    const draw = () => {
      if (!width.current) return;
      chart?.removeEventListener("input", onInput);
      el.replaceChildren();
      chart = plot(width.current);
      if (chart) {
        el.append(chart);
        chart.addEventListener("input", onInput);
      }
    };
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next === width.current) return;
      width.current = next;
      draw();
    });
    observer.observe(el);
    draw();
    return () => {
      observer.disconnect();
      chart?.removeEventListener("input", onInput);
      el.replaceChildren();
    };
  }, [plot, onFocus]);

  return <div ref={ref} />;
};

const Analytics = () => {
  const [summary, setSummary] = React.useState<Summary[] | null>(null);
  const [channel, setChannel] = React.useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [focus, setFocus] = React.useState<Partial<Record<Metric, Summary>>>({});

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/data/google-analytics/summary.csv").then((r) => r.text()),
      fetch("/data/google-analytics/channel.csv").then((r) => r.text()),
    ])
      .then(([s, c]) => {
        if (cancelled) return;
        setSummary(d3.csvParse(s, d3.autoType) as unknown as Summary[]);
        setChannel(d3.csvParse(c, d3.autoType) as unknown as Record<string, unknown>[]);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  const color = React.useMemo(
    () =>
      Plot.scale({
        color: { domain: ["", "Organic Search", "Direct", "Referral", "Organic Social", "Unassigned"] },
      }),
    [],
  );

  const filteredChannel = React.useMemo(() => {
    if (!channel) return [];
    const domain = color.domain as string[];
    return channel
      .filter((d) => domain.includes(d.channelGroup as string) && d.type !== "Unknown" && d.channelGroup !== "Unassigned")
      .sort((a, b) => domain.indexOf(b.channelGroup as string) - domain.indexOf(a.channelGroup as string));
  }, [channel, color]);

  if (error) return <p className="error">Could not load analytics: {error}</p>;
  if (!summary) return <p className="muted">Loading analytics…</p>;

  const latest = summary[summary.length - 1];

  return (
    <div>
      <div className="card-grid">
        {CARDS.map(({ key, label, percent }) => {
          const current = focus[key] ?? latest;
          const format = percent ? { style: "percent" as const } : undefined;
          return (
            <div className="card crop" key={key}>
              <h2>{label}</h2>
              <span className="big">{(current[key] as number).toLocaleString("en-US", format)}</span>
              <Figure plot={() => trendNumber(summary, { focus: current, value: key, format })} />
              <Figure
                plot={(width) => lineChart(summary, { width, y: key, percent })}
                onFocus={(value) => setFocus((prev) => ({ ...prev, [key]: value as Summary }))}
              />
            </div>
          );
        })}
      </div>
      <div className="card">
        <h2>Active users by channel</h2>
        <h3>Rolling 28-day active users</h3>
        <Figure
          plot={(width) =>
            marimekkoChart(filteredChannel, { width, x: "type", y: "channelGroup", value: "active28d", color })
          }
        />
      </div>
    </div>
  );
};

export default Analytics;
