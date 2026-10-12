import * as d3 from "d3";
import {
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  LineSeries,
  type MouseEventParams,
  type Time,
} from "lightweight-charts";
import * as React from "react";
import { useSiteTheme } from "./site-theme";

export interface Row {
  date: Date;
  [key: string]: Date | number | null;
}

/** Visible range of a chart as YYYY-MM-DD days, used to link the zoom of charts. */
export interface DateRange {
  from: string;
  to: string;
}

export interface LineDef {
  key: string;
  label: string;
}

interface Props {
  data: Row[];
  lines: LineDef[];
  colors: string[];
  aspectRatio?: number;
  visibleBars?: number;
  /** Draw the chart inside the site's `.card` box, so its edges are visible. */
  card?: boolean;
  /** Called with the date under the crosshair, and with undefined when the cursor leaves the chart. */
  onHover?: (date: Date | undefined) => void;
  /** Date to show the crosshair at while the cursor is on another chart, to link charts together. */
  crosshair?: Date;
  /** Called with the visible range whenever the reader zooms or scrolls the chart. */
  onRangeChange?: (range: DateRange) => void;
  /** Range to show, set when the reader zooms or scrolls another chart. */
  range?: DateRange;
}

type Values = Record<string, number | undefined>;

// Rows are parsed with d3.autoType, which reads a date without a timezone as
// local time, so the day is formatted back in local time too.
const dayFormat = d3.timeFormat("%Y-%m-%d");
const pad = d3.format("02");

// The crosshair reports time in whichever form the library holds it, so it is
// brought back to the YYYY-MM-DD key the data was set with.
const timeKey = (time: Time): string => {
  if (typeof time === "string") return time;
  if (typeof time === "number") return d3.utcFormat("%Y-%m-%d")(new Date(time * 1000));
  return `${time.year}-${pad(time.month)}-${pad(time.day)}`;
};

const numberOrUndefined = (value: Row[string]): number | undefined =>
  typeof value === "number" ? value : undefined;

// The latest value of each line, shown in the legend when no crosshair is on the chart.
const latestValues = (data: Row[], lines: LineDef[]): Values =>
  Object.fromEntries(
    lines.map((line) => {
      for (let i = data.length - 1; i >= 0; i--) {
        const value = numberOrUndefined(data[i][line.key]);
        if (value !== undefined) return [line.key, value];
      }
      return [line.key, undefined];
    }),
  );

const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// The chart paints on a canvas, so it cannot use the CSS tokens directly: they
// are read here and applied again whenever the site theme changes.
const themeOptions = () => {
  const grid = cssVar("--foreground-fainter");
  return {
    layout: {
      background: { type: ColorType.Solid, color: cssVar("--background") },
      textColor: cssVar("--foreground-faint"),
    },
    grid: { vertLines: { color: grid }, horzLines: { color: grid } },
    rightPriceScale: { borderColor: grid },
    timeScale: { borderColor: grid },
  };
};

/**
 * Time series drawn as lines on one price scale with TradingView's open source
 * lightweight charts. A legend above the chart shows the value of each line
 * under the crosshair, or the latest value when the cursor is off the chart.
 * Clicking a legend entry hides or shows its line.
 */
export const LineChart = ({ data, lines, colors, aspectRatio = 16 / 9, visibleBars, card = false, onHover, crosshair, onRangeChange, range }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<ISeriesApi<"Line">[]>([]);
  const [values, setValues] = React.useState<Values>({});
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(new Set());
  // Read when the chart is rebuilt, so new data keeps the lines the reader hid.
  const hiddenRef = React.useRef(hidden);
  hiddenRef.current = hidden;
  // Kept in a ref so a new callback does not rebuild the chart.
  const onHoverRef = React.useRef(onHover);
  onHoverRef.current = onHover;
  // True while the pointer is over this chart. Linked charts would otherwise
  // echo each other: a chart that follows the crosshair or the zoom reports
  // the move back, late, and drags the chart the reader is using. So only the
  // chart under the pointer reports, and only the others follow.
  const activeRef = React.useRef(false);
  const onRangeChangeRef = React.useRef(onRangeChange);
  onRangeChangeRef.current = onRangeChange;
  const theme = useSiteTheme();
  const color = (i: number) => colors[i % colors.length];

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const chart = createChart(el, { autoSize: true, ...themeOptions() });
    chartRef.current = chart;

    const series = lines.map((line, i) => {
      const s = chart.addSeries(LineSeries, {
        color: color(i),
        lineWidth: 2,
        visible: !hiddenRef.current.has(line.key),
        priceLineVisible: false,
        priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      });
      s.setData(
        data
          .filter((row) => typeof row[line.key] === "number")
          .map((row) => ({ time: dayFormat(row.date) as Time, value: row[line.key] as number })),
      );
      return s;
    });
    seriesRef.current = series;

    const latest = (): Values =>
      Object.fromEntries(
        lines.map((line, i) => {
          const points = series[i].data();
          const last = points[points.length - 1];
          return [line.key, last && "value" in last ? last.value : undefined];
        }),
      );

    const dates = new Map(data.map((row) => [dayFormat(row.date), row.date]));

    const onCrosshairMove = (param: MouseEventParams) => {
      if (!param.time) {
        setValues(latest());
        if (activeRef.current) onHoverRef.current?.(undefined);
        return;
      }
      if (activeRef.current) onHoverRef.current?.(dates.get(timeKey(param.time)));
      setValues(
        Object.fromEntries(
          lines.map((line, i) => {
            const point = param.seriesData.get(series[i]);
            return [line.key, point && "value" in point ? point.value : undefined];
          }),
        ),
      );
    };
    chart.subscribeCrosshairMove(onCrosshairMove);
    setValues(latest());

    const onRangeMove = (visible: { from: Time; to: Time } | null) => {
      if (!visible || !activeRef.current) return;
      onRangeChangeRef.current?.({ from: timeKey(visible.from), to: timeKey(visible.to) });
    };
    chart.timeScale().subscribeVisibleTimeRangeChange(onRangeMove);

    // Leaving clears the hover itself: the chart's own leave event may come
    // after the pointer is already marked as gone.
    const enter = () => {
      activeRef.current = true;
    };
    const leave = () => {
      activeRef.current = false;
      onHoverRef.current?.(undefined);
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);

    // Logical indices run over the union of all dates, which is the longest series.
    const bars = Math.max(0, ...series.map((s) => s.data().length));
    if (visibleBars && bars > visibleBars) {
      chart.timeScale().setVisibleLogicalRange({ from: bars - visibleBars, to: bars - 1 });
    } else {
      chart.timeScale().fitContent();
    }

    return () => {
      chart.unsubscribeCrosshairMove(onCrosshairMove);
      chart.timeScale().unsubscribeVisibleTimeRangeChange(onRangeMove);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = [];
    };
  }, [data, lines, colors, visibleBars]);

  // Follow the zoom of a linked chart, by date rather than by bar index, so
  // the charts stay aligned even when one has days the other does not.
  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !range || activeRef.current) return;
    chart.timeScale().setVisibleRange({ from: range.from as Time, to: range.to as Time });
  }, [range, data]);

  const rowsByDay = React.useMemo(() => new Map(data.map((row) => [dayFormat(row.date), row])), [data]);

  // Follow the crosshair of a linked chart. The library has no built in link
  // between charts: the crosshair is placed on the first visible line, at that
  // line's value on the day, and cleared when the day is not in this chart.
  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart || activeRef.current) return;
    const key = crosshair ? dayFormat(crosshair) : undefined;
    const row = key ? rowsByDay.get(key) : undefined;
    const i = row
      ? lines.findIndex((line) => !hiddenRef.current.has(line.key) && typeof row[line.key] === "number")
      : -1;
    if (!row || i < 0 || !key) {
      chart.clearCrosshairPosition();
      setValues(latestValues(data, lines));
      return;
    }
    chart.setCrosshairPosition(row[lines[i].key] as number, key as Time, seriesRef.current[i]);
    // A crosshair placed from code does not report the values under it, so the
    // legend is filled from the row, after the chart's own event has fired.
    setValues(Object.fromEntries(lines.map((line) => [line.key, numberOrUndefined(row[line.key])])));
  }, [crosshair, rowsByDay, data, lines]);

  React.useEffect(() => {
    chartRef.current?.applyOptions(themeOptions());
  }, [theme]);

  // A hidden series is also left out of the price scale's autoscale, so the
  // remaining lines fill the chart.
  React.useEffect(() => {
    seriesRef.current.forEach((s, i) => s.applyOptions({ visible: !hidden.has(lines[i].key) }));
  }, [hidden, lines]);

  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  return (
    <div className={card ? "card" : undefined}>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-2">
        {lines.map((line, i) => (
          <button
            key={line.key}
            type="button"
            onClick={() => toggle(line.key)}
            aria-pressed={!hidden.has(line.key)}
            title={hidden.has(line.key) ? "Show" : "Hide"}
            className={`inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 ${hidden.has(line.key) ? "opacity-40 line-through" : ""}`}
            style={{ color: "inherit", font: "inherit" }}
          >
            <span className="inline-block w-3 h-0.5" style={{ background: color(i) }} />
            {line.label}
            <span className="tabular-nums" style={{ color: "var(--foreground-faint)" }}>
              {values[line.key]?.toFixed(2) ?? ""}
            </span>
          </button>
        ))}
      </div>
      <div style={{ width: "100%", position: "relative", paddingTop: `${(1 / aspectRatio) * 100}%` }}>
        <div ref={ref} className="line-chart" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      </div>
    </div>
  );
};
