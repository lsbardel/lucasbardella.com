---
title: UK Interest Rates
theme: dashboard
toc: false
---

# UK Interest Rates

UK Yield curve data from the [Bank of England](https://www.bankofengland.co.uk/statistics/yield-curves).

```js
const rates = FileAttachment("../data/boe.csv").csv({typed: true});
const maturities = ["1y", "2y", "3y", "4y", "5y", "7y", "10y", "15y", "20y", "25y", "30y", "40y"];
const symbols = maturities.map(m => ({ symbol: m, description: `UK ${m} yield`, type: "bond" }));
const displaySymbols = symbols.filter(s => ["2y", "5y", "10y", "30y"].includes(s.symbol));

const spreadDefs = [
  { symbol: "10y-2y", description: "10y - 2y", a: "10y", b: "2y" },
  { symbol: "10y-5y", description: "10y - 5y", a: "10y", b: "5y" },
  { symbol: "30y-10y", description: "30y - 10y", a: "30y", b: "10y" },
];
```

```js
const spreads = rates.map(row => ({
  date: row.date,
  ...Object.fromEntries(spreadDefs.map(({ symbol, a, b }) => [symbol, row[a] != null && row[b] != null ? row[a] - row[b] : null]))
}));
const spreadSymbols = spreadDefs.map(({ symbol, description }) => ({ symbol, description, type: "spread" }));
```

```tsx
import {TradingViewChart} from "../components/trading-view.js";
import {schemes} from "../components/palettes.js";
const palette = schemes["Observable10"] as string[];
```

<div class="grid xl:grid-cols-2 grid-cols-1">
<div>
<h2>Rates</h2>

```tsx
display(<TradingViewChart
    data={rates}
    symbols={symbols}
    displaySymbols={displaySymbols}
    colors={palette}
    visibleBars={1000}
    aspectRatio={1.5}
  />
);
```
</div>
<div>
<h2>Spreads</h2>

```tsx
display(<TradingViewChart
    data={spreads}
    symbols={spreadSymbols}
    colors={palette}
    visibleBars={1000}
    aspectRatio={1.5}
  />
);
```
</div>
