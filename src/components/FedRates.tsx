import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as React from "react";
import { tsZoom } from "./zoom.js";

/**
 * Port of content/market/fed.md.
 *
 * That page leaned on four Observable features at once: `FileAttachment` for
 * the CSV, `Mutable` for the zoom window shared between cells, `resize()` for
 * responsive plots, and `${...}` interpolation to place them in the layout.
 * All four become ordinary React here: a fetch, a piece of state, a
 * ResizeObserver, and JSX.
 */

const RATE_DOMAIN = ["1M", "3M", "6M", "1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "20Y", "30Y"];

interface Row {
  date: Date;
  [key: string]: unknown;
}

const rateCode = (maturity: string): string => {
  const n = maturity.length;
  const prefix = maturity.slice(n - 1) === "M" ? "month_" : "year_";
  return `${prefix}${maturity.slice(0, n - 1)}`;
};

const rateMarks = (flat: unknown[], extra = {}) => [
  Plot.lineY(flat, { x: "date", y: "rate", stroke: "maturity", ...extra }),
];

const flatten = (rows: Row[]) =>
  rows.flatMap((d) => RATE_DOMAIN.map((maturity) => ({ date: d.date, maturity, rate: d[rateCode(maturity)] })));

/**
 * Replaces Observable's `resize((width) => ...)`. The width guard matters: a
 * plot redraw changes the element's contents, and without it the observer can
 * drive itself in a loop.
 */
const PlotFigure = ({ plot }: { plot: (width: number) => Node }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const width = React.useRef(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const draw = () => {
      if (!width.current) return;
      el.replaceChildren();
      el.append(plot(width.current));
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
      el.replaceChildren();
    };
  }, [plot]);

  return <div ref={ref} />;
};

const plotRates = (flat: unknown[], { width, domain, label }: { width: number; domain?: string[]; label: string }) =>
  Plot.plot({
    width,
    color: { legend: true, domain },
    y: { label, grid: true },
    marks: [...rateMarks(flat, { tip: true }), Plot.crosshair(flat, { x: "date", y: "rate" }), Plot.ruleY([0])],
  });

const plotCurve = (data: Row[], { width }: { width: number }) => {
  const dates = Array.from(new Set(data.map((d) => d.date))).sort((a, b) => +a - +b);
  const fmt = d3.utcFormat("%d %B %Y");
  const domain = dates.map(fmt);
  const curve = RATE_DOMAIN.flatMap((maturity) =>
    data.map((d) => ({ maturity, rate: d[rateCode(maturity)], date: fmt(d.date) })),
  );
  return Plot.plot({
    width,
    color: { scheme: "Blues", domain, legend: true },
    y: { label: "Rate (%)", tickFormat: (d: number) => `${d}%`, grid: true },
    x: { domain: RATE_DOMAIN },
    marks: [
      Plot.line(curve, { x: "maturity", y: "rate", stroke: "date" }),
      Plot.dot(curve, { x: "maturity", y: "rate", fill: "date", r: 5, tip: true }),
      Plot.ruleY([0]),
    ],
  });
};

const FedRates = () => {
  const [rates, setRates] = React.useState<Row[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [startEnd, setStartEnd] = React.useState<[Date, Date] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/data/fed/yield-curves.csv")
      .then((response) => {
        if (!response.ok) throw new Error(`yield-curves.csv returned ${response.status}`);
        return response.text();
      })
      .then((text) => {
        if (cancelled) return;
        const parsed = d3.csvParse(text, d3.autoType) as unknown as Row[];
        setRates(parsed);
        setStartEnd([parsed[parsed.length - 1000].date, parsed[parsed.length - 1].date]);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  // `initialStartEnd` in the original, kept stable for the brush.
  const initial = React.useMemo<[Date, Date] | null>(
    () => (rates ? [rates[rates.length - 1000].date, rates[rates.length - 1].date] : null),
    [rates],
  );

  const allFlat = React.useMemo(() => (rates ? flatten(rates) : []), [rates]);

  const zoomed = React.useMemo(
    () => (rates && startEnd ? rates.filter((d) => d.date >= startEnd[0] && d.date <= startEnd[1]) : []),
    [rates, startEnd],
  );

  const derived = React.useMemo(() => {
    const flatRates = flatten(zoomed);
    const spreads = zoomed.flatMap((d) => {
      const out: unknown[] = [];
      if (!d.year_10) return out;
      if (d.year_2) out.push({ date: d.date, maturity: "10Y-2Y", rate: 100 * ((d.year_10 as number) - (d.year_2 as number)) });
      if (d.year_5) out.push({ date: d.date, maturity: "10Y-5Y", rate: 100 * ((d.year_10 as number) - (d.year_5 as number)) });
      if (d.year_30) out.push({ date: d.date, maturity: "30Y-10Y", rate: 100 * ((d.year_30 as number) - (d.year_10 as number)) });
      return out;
    });
    const flies = zoomed.flatMap((d) => {
      const out: unknown[] = [];
      if (!d.year_10 || !d.year_5) return out;
      if (d.year_2)
        out.push({ date: d.date, maturity: "10Y-5Y-2Y", rate: -100 * ((d.year_10 as number) - 2 * (d.year_5 as number) + (d.year_2 as number)) });
      if (d.year_30)
        out.push({ date: d.date, maturity: "30Y-10Y-5Y", rate: -100 * ((d.year_30 as number) - 2 * (d.year_10 as number) + (d.year_5 as number)) });
      return out;
    });
    const m = Math.floor(zoomed.length / 2);
    const curveData = zoomed.length ? [zoomed[0], zoomed[m], zoomed[zoomed.length - 1]] : [];
    return { flatRates, spreads, flies, curveData };
  }, [zoomed]);

  const brush = React.useCallback(
    (width: number) =>
      tsZoom({
        width,
        height: 80,
        initialStartEnd: initial,
        setStartEnd: (se: [Date, Date] | undefined) => setStartEnd(se ?? initial),
        marks: rateMarks(allFlat),
      }),
    [allFlat, initial],
  );

  const curves = React.useCallback(
    (width: number) => plotRates(derived.flatRates, { width, domain: RATE_DOMAIN, label: "Rate (%)" }),
    [derived],
  );
  const spreads = React.useCallback((width: number) => plotRates(derived.spreads, { width, label: "Spread (bps)" }), [derived]);
  const flies = React.useCallback((width: number) => plotRates(derived.flies, { width, label: "Butterfly (bps)" }), [derived]);
  const curve = React.useCallback((width: number) => plotCurve(derived.curveData, { width }), [derived]);

  if (error) return <p className="error">Could not load the yield curves: {error}</p>;
  if (!rates || !startEnd) return <p className="muted">Loading yield curves…</p>;

  return (
    <div>
      <div className="card"><PlotFigure plot={brush} /></div>
      <div className="card-grid">
        <div className="card"><h2>Yield curve rates</h2><PlotFigure plot={curves} /></div>
        <div className="card"><h2>Yield curve spreads (bps)</h2><PlotFigure plot={spreads} /></div>
        <div className="card"><h2>Yield curves at three dates in the zoom window</h2><PlotFigure plot={curve} /></div>
        <div className="card"><h2>Yield curve butterflies (bps)</h2><PlotFigure plot={flies} /></div>
      </div>
    </div>
  );
};

export default FedRates;
