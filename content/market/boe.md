---
title: UK Interest Rates
theme: dashboard
toc: false
private: true
---

```js
const rates = FileAttachment("../data/boe.csv").csv({typed: true});
```

```js
// ge the column names
const columns = Object.keys(rates.shift()).filter(col => col !== "date");
```

```tsx
import {TradingViewChart} from "../components/trading-view.js";
<TradingViewChart
  data={rates}
  symbol="10y"
/>
```


```js
display(columns)
```

```js
display(rates)
```
