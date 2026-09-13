import * as d3 from "d3";
import * as React from "react";
import { useRemote } from "./inputs";
import { schemes } from "./palettes";
import { TradingViewChart, type SymbolDef } from "./trading-view";

const MATURITIES = ["1y", "2y", "3y", "4y", "5y", "7y", "10y", "15y", "20y", "25y", "30y", "40y"];

const SYMBOLS: SymbolDef[] = MATURITIES.map((m) => ({
  symbol: m,
  description: `UK ${m} yield`,
  type: "bond",
}));

const DISPLAY_SYMBOLS = SYMBOLS.filter((s) => ["2y", "5y", "10y", "30y"].includes(s.symbol));

const SPREAD_DEFS = [
  { symbol: "10y-2y", description: "10y - 2y", a: "10y", b: "2y" },
  { symbol: "10y-5y", description: "10y - 5y", a: "10y", b: "5y" },
  { symbol: "30y-10y", description: "30y - 10y", a: "30y", b: "10y" },
];

const SPREAD_SYMBOLS: SymbolDef[] = SPREAD_DEFS.map(({ symbol, description }) => ({
  symbol,
  description,
  type: "spread",
}));

const palette = schemes["Observable10"] as string[];

/**
 * Replaces the cells of content/market/boe.md: the rates attachment, the
 * derived spread series, and the two charts laid out side by side.
 */
const BoeRates = () => {
  const rates = useRemote("/data/boe.csv", (text) => d3.csvParse(text, d3.autoType) as any[]);

  const spreads = React.useMemo(
    () =>
      (rates ?? []).map((row) => ({
        date: row.date,
        ...Object.fromEntries(
          SPREAD_DEFS.map(({ symbol, a, b }) => [
            symbol,
            row[a] != null && row[b] != null ? row[a] - row[b] : null,
          ]),
        ),
      })),
    [rates],
  );

  if (!rates) return <p>Loading Bank of England yield curves…</p>;

  return (
    <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
      <div>
        <h2>Rates</h2>
        <TradingViewChart
          data={rates}
          symbols={SYMBOLS}
          displaySymbols={DISPLAY_SYMBOLS}
          colors={palette}
          visibleBars={1000}
          aspectRatio={1.5}
        />
      </div>
      <div>
        <h2>Spreads</h2>
        <TradingViewChart
          data={spreads}
          symbols={SPREAD_SYMBOLS}
          colors={palette}
          visibleBars={1000}
          aspectRatio={1.5}
        />
      </div>
    </div>
  );
};

export default BoeRates;
