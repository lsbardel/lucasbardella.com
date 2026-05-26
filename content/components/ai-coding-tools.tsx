import * as Plot from "npm:@observablehq/plot";
import * as React from "npm:react";

interface MarketShareEntry {
  tool: string;
  share: number;
  category: string;
}

interface TimelineEntry {
  date: string;
  event: string;
  tool: string;
}

interface FeatureEntry {
  tool: string;
  feature: string;
  score: number;
}

interface MarketShareProps {
  data: MarketShareEntry[];
}

interface TimelineProps {
  data: TimelineEntry[];
}

interface FeatureProps {
  data: FeatureEntry[];
}

const BUTTON_BASE: React.CSSProperties = {
  padding: "0.3rem 1.1rem",
  border: "1px solid var(--theme-foreground-muted, #666)",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.85rem",
  background: "transparent",
  color: "inherit",
  marginRight: "0.5rem",
};

const BUTTON_ACTIVE: React.CSSProperties = {
  ...BUTTON_BASE,
  background: "var(--theme-foreground-focus, #3b82f6)",
  color: "#fff",
  borderColor: "var(--theme-foreground-focus, #3b82f6)",
  fontWeight: 600,
};

type Category = "paid" | "opensource" | "all";

const LABELS: Record<Category, string> = {
  paid: "Commercial",
  opensource: "Open Source",
  all: "All Tools",
};

export const MarketShareChart = ({ data }: MarketShareProps) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [category, setCategory] = React.useState<Category>("all");

  React.useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const filtered = category === "all" ? data : data.filter((d) => d.category === category);

    const plot = Plot.plot({
      title: "AI Coding Tools Market Share (2026)",
      width: el.offsetWidth,
      height: 320,
      marginLeft: 120,
      marginRight: 50,
      style: { fontSize: "14px" },
      x: { label: "Market Share (%)", grid: true, domain: [0, 50] },
      y: { label: null },
      marks: [
        Plot.barX(filtered, {
          x: "share",
          y: "tool",
          fill: "category",
          sort: { y: "-x" },
          rx: 6,
        }),
        Plot.text(filtered, {
          x: "share",
          y: "tool",
          text: (d: MarketShareEntry) => `${d.share}%`,
          dx: 18,
          fontSize: 12,
        }),
      ],
    });

    el.innerHTML = "";
    el.appendChild(plot);
  }, [data, category]);

  return (
    <div>
      <div style={{ marginBottom: "1.2rem" }}>
        {(Object.keys(LABELS) as Category[]).map((v) => (
          <button key={v} onClick={() => setCategory(v)} style={category === v ? BUTTON_ACTIVE : BUTTON_BASE}>
            {LABELS[v]}
          </button>
        ))}
      </div>
      <div ref={chartRef} />
    </div>
  );
};

export const FeatureComparisonChart = ({ data }: FeatureProps) => {
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const plot = Plot.plot({
      title: "Feature Comparison Across AI Coding Tools",
      width: el.offsetWidth,
      height: 380,
      marginLeft: 130,
      marginBottom: 40,
      style: { fontSize: "13px" },
      x: { label: null, domain: ["IDE Integration", "CLI Agent", "Multi-file Edits", "Model Choice", "Privacy/Local", "Cost"] },
      y: { label: null },
      color: { legend: true, scheme: "YlGnBu", domain: [0, 5], label: "Score" },
      marks: [
        Plot.cell(data, {
          x: "feature",
          y: "tool",
          fill: "score",
          rx: 4,
        }),
        Plot.text(data, {
          x: "feature",
          y: "tool",
          text: (d: FeatureEntry) => d.score > 0 ? `${d.score}` : "",
          fontSize: 12,
        }),
      ],
    });

    el.innerHTML = "";
    el.appendChild(plot);
  }, [data]);

  return <div ref={chartRef} />;
};

export const AdoptionTimelineChart = ({ data }: TimelineProps) => {
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const parsed = data.map((d) => ({ ...d, date: new Date(d.date) }));

    const plot = Plot.plot({
      title: "AI Coding Tools Timeline (2021–2026)",
      width: el.offsetWidth,
      height: 300,
      marginLeft: 60,
      marginRight: 20,
      marginBottom: 30,
      style: { fontSize: "13px" },
      x: { type: "utc", label: null },
      y: { label: null },
      marks: [
        Plot.dot(parsed, {
          x: "date",
          y: "tool",
          fill: "tool",
          r: 8,
        }),
        Plot.tip(parsed, Plot.pointer({
          x: "date",
          y: "tool",
          title: (d: { tool: string; event: string; date: Date }) =>
            `${d.tool}\n${d.event}\n${d.date.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`,
        })),
      ],
    });

    el.innerHTML = "";
    el.appendChild(plot);
  }, [data]);

  return <div ref={chartRef} />;
};
