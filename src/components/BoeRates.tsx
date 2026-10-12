import * as d3 from "d3";
import * as React from "react";
import { useRemote } from "./shared/inputs";
import { type DateRange, type LineDef, LineChart, type Row } from "./shared/line-chart";
import { schemes } from "./shared/palettes";
import YieldCurve, { type Maturity } from "./yield-curve";

const MATURITIES: Maturity[] = ["1y", "2y", "3y", "4y", "5y", "7y", "10y", "15y", "20y", "25y", "30y", "40y"].map(
  (key) => ({ key, years: parseInt(key, 10) }),
);

const RATE_LINES: LineDef[] = ["2y", "5y", "10y", "30y"].map((m) => ({ key: m, label: m }));

const SPREAD_DEFS = [
  { key: "10y-2y", label: "10y - 2y", a: "10y", b: "2y" },
  { key: "10y-5y", label: "10y - 5y", a: "10y", b: "5y" },
  { key: "30y-10y", label: "30y - 10y", a: "30y", b: "10y" },
];

const SPREAD_LINES: LineDef[] = SPREAD_DEFS.map(({ key, label }) => ({ key, label }));

interface Props {
  /** Name of a colour scheme in `palettes`, for the lines and the yield curve. */
  palette?: string;
}

/**
 * Replaces the cells of content/market/boe.md: the rates attachment, the
 * derived spread series, and the two charts laid out side by side.
 */
const BoeRates = ({ palette: scheme = "Observable10" }: Props) => {
  // Memoised: a new array on every render would make the charts rebuild
  // themselves each time the reader hovers them.
  const palette = React.useMemo(() => [...(schemes[scheme] ?? schemes["Observable10"])], [scheme]);
  const rates = useRemote("/data/boe.csv", (text) => d3.csvParse(text, d3.autoType) as unknown as Row[]);

  const spreads = React.useMemo(
    () =>
      (rates ?? []).map(
        (row): Row => ({
          date: row.date,
          ...Object.fromEntries(
            SPREAD_DEFS.map(({ key, a, b }) => {
              const x = row[a];
              const y = row[b];
              return [key, typeof x === "number" && typeof y === "number" ? x - y : null];
            }),
          ),
        }),
      ),
    [rates],
  );

  // The curve follows the date under the cursor on either chart, and shows
  // the latest day otherwise.
  const [hover, setHover] = React.useState<Date>();
  // Each chart reports its own Date object for a day, so an update on the same
  // day keeps the current one and does not re-render the linked charts.
  const onHover = React.useCallback(
    (date: Date | undefined) => setHover((prev) => (prev?.getTime() === date?.getTime() ? prev : date)),
    [],
  );
  const [range, setRange] = React.useState<DateRange>();
  const onRangeChange = React.useCallback(
    (next: DateRange) => setRange((prev) => (prev?.from === next.from && prev?.to === next.to ? prev : next)),
    [],
  );
  const byTime = React.useMemo(() => new Map((rates ?? []).map((row) => [+row.date, row])), [rates]);

  if (!rates) return <p>Loading Bank of England yield curves…</p>;

  const curve = (hover && byTime.get(+hover)) ?? rates[rates.length - 1];

  return (
    <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
      <div>
        <h2>Rates</h2>
        <LineChart data={rates} lines={RATE_LINES} colors={palette} visibleBars={1000} aspectRatio={1.5} card onHover={onHover} crosshair={hover} onRangeChange={onRangeChange} range={range} />
      </div>
      <div>
        <h2>Spreads</h2>
        <LineChart data={spreads} lines={SPREAD_LINES} colors={palette} visibleBars={1000} aspectRatio={1.5} card onHover={onHover} crosshair={hover} onRangeChange={onRangeChange} range={range} />
      </div>
      <div>
        <h2>Yield Curve</h2>
        {curve && <YieldCurve row={curve} maturities={MATURITIES} color={palette[0]} card />}
      </div>
    </div>
  );
};

export default BoeRates;
