import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as React from "react";
import type { Row } from "./shared/line-chart";

export interface Maturity {
  key: string;
  years: number;
}

interface Props {
  row: Row;
  maturities: Maturity[];
  color: string;
  aspectRatio?: number;
  card?: boolean;
}

const dateFormat = d3.timeFormat("%d %B %Y");

/**
 * The yield curve of one day: yield against maturity in years. Drawn with
 * Observable Plot because lightweight charts only has a time axis.
 */
const YieldCurve = ({ row, maturities, color, aspectRatio = 1.5, card = false }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);

  // The width guard matters: redrawing the plot changes the element's contents,
  // and without it the observer can drive itself in a loop.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      setWidth((prev) => (prev === next ? prev : next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !width) return;
    const points = maturities.flatMap((m) => {
      const rate = row[m.key];
      return typeof rate === "number" ? [{ years: m.years, rate }] : [];
    });
    const plot = Plot.plot({
      width,
      height: Math.round(width / aspectRatio),
      style: { fontSize: "14px" },
      // The default bottom margin fits Plot's 10px text, not 14px: give the axis
      // label its own line below the ticks.
      marginBottom: 50,
      x: { label: "Maturity (years)", labelAnchor: "center", labelOffset: 42 },
      y: { label: "Yield (%)", grid: true },
      marks: [
        Plot.lineY(points, { x: "years", y: "rate", stroke: color, strokeWidth: 2 }),
        Plot.dot(points, { x: "years", y: "rate", fill: color }),
      ],
    });
    el.replaceChildren(plot);
    return () => plot.remove();
  }, [row, maturities, color, aspectRatio, width]);

  return (
    <div className={card ? "card" : undefined}>
      <div className="text-sm mb-2">{dateFormat(row.date)}</div>
      <div ref={ref} />
    </div>
  );
};

export default YieldCurve;
