---
title: UK Interest Rates
theme: dashboard
toc: false
---

# UK Interest Rates

UK Yield curve from the [Bank of England](https://www.bankofengland.co.uk/statistics/yield-curves).

**Work in progress**

```js
const rates = FileAttachment("../data/boe.csv").csv({typed: true});
const maturities = ["1y", "2y", "3y", "4y", "5y", "7y", "10y", "15y", "20y", "25y", "30y", "40y"];
const symbols = maturities.map(m => ({ symbol: m, description: `UK ${m} yield`, type: "bond" }));
```

```tsx
import {TradingViewChart} from "../components/trading-view.js";
display(<TradingViewChart
  data={rates}
  symbols={symbols}
/>);
```
