import * as Plot from "@observablehq/plot";
import { useStore } from "@nanostores/react";
import * as d3 from "d3";
import * as React from "react";
import { OptionRow } from "../OptionTable";
import { Column, DataTable, sparkbar } from "./DataTable";
import {
  $asset,
  $maturity,
  formatDate,
  formatTime,
  fwd,
  ttm,
  useAssetData,
  type OptionRowData,
  type TermRow,
} from "./store";

/** Draws a Plot figure into a div and redraws it on width changes, like `resize`. */
const usePlot = (render: (width: number) => HTMLElement | null, deps: React.DependencyList) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const draw = () => {
      const figure = render(el.offsetWidth);
      el.innerHTML = "";
      if (figure) el.append(figure);
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
};

/** `Inputs.select(["BTC", "ETH"], {label: "Asset", value: "ETH"})`. */
export const AssetSelect = () => {
  const asset = useStore($asset);
  return (
    <div className="flex items-center gap-2 text-sm mb-4">
      <span className="text-[var(--foreground-faint)]">Asset</span>
      <select value={asset} onChange={(event) => $asset.set(event.target.value as "BTC" | "ETH")}>
        <option value="BTC">BTC</option>
        <option value="ETH">ETH</option>
      </select>
    </div>
  );
};

/** The two `<h4>` lines the Observable page built with an html`` template. */
export const SpotHeader = () => {
  const { asset, data } = useAssetData();
  if (!data) return <p>Loading {asset}…</p>;
  return (
    <>
      <h4>
        {asset} on <span style={{ color: "#00b4d8" }}>{formatTime(new Date(data.spot.timestamp))}</span>
      </h4>
      <h4>
        Spot price <span style={{ color: "#00b4d8" }}>{fwd(data.spot.spot)}</span>
      </h4>
    </>
  );
};

export const TermStructureTable = () => {
  const { data } = useAssetData();
  if (!data) return null;
  const ts = data.ts;
  const columns: Column<TermRow>[] = [
    { key: "maturity", header: "Maturity", format: (v) => formatDate(new Date(v)) },
    { key: "ttm", header: "Time to Maturity", format: (v) => ttm(v) },
    { key: "forward", header: "Forward Price", format: (v) => fwd(v) },
    { key: "basis", header: "Basis", format: (v) => fwd(v) },
    {
      key: "rate_percent",
      header: "Rate (%)",
      format: sparkbar(d3.max(ts, (d) => d.rate_percent)!, "#457b9d", (v) => d3.format(".3%")(v * 0.01)),
    },
    { key: "open_interest", header: "Open Interest", format: sparkbar(d3.max(ts, (d) => d.open_interest)!, "#457b9d") },
    { key: "volume", header: "Volume", format: sparkbar(d3.max(ts, (d) => d.volume)!, "#9b2226") },
  ];
  return <DataTable rows={ts} columns={columns} height={400} />;
};

export const RateChart = () => {
  const { asset, data } = useAssetData();
  const ref = usePlot(
    (width) => {
      if (!data) return null;
      const ts = data.ts;
      const minRate = d3.min(ts, (d) => +d.rate_percent)!;
      const maxRate = d3.max(ts, (d) => +d.rate_percent)!;
      const minY = minRate - (maxRate - minRate) * 0.2;
      return Plot.plot({
        width,
        title: `Implied annualized rate for ${asset}`,
        marks: [
          Plot.frame(),
          Plot.areaY(ts, { x: "maturity", y1: minY, y: "rate_percent", fill: "url(#rate-gradient)" }),
          Plot.dot(ts, {
            x: "maturity",
            y: "rate_percent",
            r: 6,
            fill: "#d5ec63ff",
            stroke: "black",
            tip: {
              fontSize: 14,
              format: {
                x: (d: any) => formatDate(new Date(d)),
                y: (d: any) => d3.format(".2%")(d * 0.01),
              },
            },
          }),
        ],
      });
    },
    [asset, data],
  );
  return (
    <>
      {/* The gradient the area fill refers to, a bare svg on the old page. */}
      <svg height="0" width="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="rate-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d5ec63ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d5ec63ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div ref={ref} />
    </>
  );
};

/** The maturities present in the data, plus "All", as the old select cell built. */
const useMaturities = (ops: OptionRowData[] | undefined): string[] => {
  if (!ops) return ["All"];
  const unique = new Set(ops.map((d) => formatDate(new Date(d.maturity))));
  const dates = Array.from(unique)
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());
  return ["All", ...dates.map((d) => formatDate(d))];
};

const useFilteredOps = (): { ops: OptionRowData[]; maturity: string } => {
  const { data } = useAssetData();
  const maturity = useStore($maturity);
  const ops = React.useMemo(() => {
    if (!data) return [];
    return maturity === "All"
      ? data.ops
      : data.ops.filter((d) => formatDate(new Date(d.maturity)) === maturity);
  }, [data, maturity]);
  return { ops, maturity };
};

export const MaturitySelect = () => {
  const { data } = useAssetData();
  const maturity = useStore($maturity);
  const maturities = useMaturities(data?.ops);
  // A maturity from the previous asset may not exist in the new one.
  React.useEffect(() => {
    if (data && !maturities.includes(maturity)) $maturity.set("All");
  }, [data, maturities, maturity]);
  return (
    <div className="flex items-center gap-2 text-sm mb-4">
      <span className="text-[var(--foreground-faint)]">Maturity</span>
      <select value={maturity} onChange={(event) => $maturity.set(event.target.value)}>
        {maturities.map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>
    </div>
  );
};

export const SmileChart = () => {
  const { ops, maturity } = useFilteredOps();
  const ref = usePlot(
    (width) => {
      if (ops.length === 0) return null;
      const radius = d3.scaleSqrt([0, d3.max(ops, (d) => d.volume)!], [2, 30]);
      return Plot.plot({
        width,
        height: 500,
        title: `Implied Volatility Smile for ${maturity === "All" ? "All Maturities" : maturity}`,
        x: { label: "Moneyness", grid: true, labelFontSize: 14 },
        y: {
          label: "Implied Volatility",
          tickFormat: (v: number) => d3.format(".0%")(v),
          grid: true,
          labelFontSize: 14,
        },
        color: { legend: true, domain: ["Bid", "Ask"], range: ["#228435ff", "#af1a06ff"], label: "Option Type" },
        marks: [
          Plot.dot(ops, {
            x: "moneyness_ttm",
            y: "implied_vol",
            r: (d: OptionRowData) => radius(d.volume),
            fill: (d: OptionRowData) => (d.side === "bid" ? "#228435ff" : "#af1a06ff"),
          }),
          Plot.tip(
            ops,
            Plot.pointer({
              x: "moneyness_ttm",
              y: "implied_vol",
              channels: {
                Moneyness: { value: "moneyness_ttm", format: ",.3f" },
                IV: { value: "implied_vol", format: ".2%" },
                Volume: { value: "volume", format: ",.0f" },
              },
              fontSize: 14,
            }),
          ),
        ],
      });
    },
    [ops, maturity],
  );
  return <div ref={ref} />;
};

export const OptionsTable = () => {
  const { asset } = useAssetData();
  const { ops } = useFilteredOps();
  const [selected, setSelected] = React.useState<OptionRowData | null>(null);
  React.useEffect(() => setSelected(null), [asset, ops]);
  if (ops.length === 0) return null;
  const columns: Column<OptionRowData>[] = [
    { key: "strike", header: "Strike" },
    { key: "maturity", header: "Maturity", format: (v) => formatDate(new Date(v)) },
    { key: "ttm", header: "Time to Maturity", format: (v) => ttm(v) },
    { key: "moneyness_ttm", header: "Moneyness", format: (v) => fwd(v) },
    { key: "implied_vol", header: "IV", format: (v) => d3.format(".2%")(v) },
    { key: "volume", header: "Volume", format: sparkbar(d3.max(ops, (d) => d.volume)!, "#9b2226") },
    {
      key: "open_interest",
      header: "Open Interest",
      format: sparkbar(d3.max(ops, (d) => d.open_interest)!, "#457b9d"),
    },
  ];
  return (
    <>
      <DataTable rows={ops} columns={columns} height={400} onSelect={setSelected} selected={selected} />
      {selected && <OptionRow asset={asset} option={selected as any} />}
    </>
  );
};
