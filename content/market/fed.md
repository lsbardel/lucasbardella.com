---
title: US Interest Rates
theme: dashboard
toc: false
---

# US Interest Rates

```js
import {tsZoom} from "../components/zoom.js";
const rates = FileAttachment("../data/fed/yield-curves.csv").csv({typed: true});

const rateCode = (maturity) => {
  const n = maturity.length;
  const prefix = maturity.substring(n-1) === "M" ? "month_" : "year_";
  return `${prefix}${maturity.substring(0, n-1)}`;
};

const rateMarks = (flat, extra = {}) => {
  return [
    Plot.lineY(flat, { x: "date", y: "rate", stroke: "maturity", ...extra }),
  ];
}
```

```js
const rateDomain = ["1M", "3M", "6M", "1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "20Y", "30Y"];
const allFlatRates = rates.flatMap(d => {
  const date = d.date;
  return rateDomain.map(maturity => ({ date, maturity, rate: d[rateCode(maturity)] }));
});

const initialStartEnd = [rates.at(-1000).date, rates.at(-1).date];
const startEnd = Mutable(initialStartEnd);
const setStartEnd = (se) => startEnd.value = (se ?? initialStartEnd);
const getStartEnd = () => startEnd.value;
```


```js
const zoomed = rates.filter(d => d.date >= startEnd[0] && d.date <= startEnd[1]);

const m = Math.floor(zoomed.length/2);
const curveData = [zoomed.at(0), zoomed.at(m), zoomed.at(-1)];
const flatRates = zoomed.flatMap(d => {
  const date = d.date;
  return rateDomain.map(maturity => ({ date, maturity, rate: d[rateCode(maturity)] }));
});

const spreads = zoomed.flatMap(d => {
  const date = d.date;
  const data = [];
  if (!d.year_10) return [];
  if (d.year_2) data.push({ date, maturity: "10Y-2Y", rate: d.year_10 - d.year_2 });
  if (d.year_5) data.push({ date, maturity: "10Y-5Y", rate: d.year_10 - d.year_5 });
  if (d.year_30) data.push({ date, maturity: "30Y-10Y", rate: d.year_30 - d.year_10 });
  return data;
});

const plotRates = (flat, {width, height, domain}) => {
  return Plot.plot({
    width,
    height,
    color: { legend: true, domain },
    y: {
      grid: true
    },
    marks: [
      ...rateMarks(flat, { tip: true }),
      Plot.crosshair(flat, {x: "date", y: "rate"}),
      Plot.ruleY([0]),
    ]
  });
};

const plotCurve = (data, {width, height}) => {
  const dates = Array.from(new Set(data.map(d => d.date))).sort((a, b) => a - b);
  const fmt = d3.utcFormat("%d %B %Y");
  const domain = dates.map(fmt);
  const curve = rateDomain.flatMap(maturity => {
    return data.map(d => {
      return { maturity, rate: d[rateCode(maturity)], date: fmt(d.date) };
    });
  });
  return Plot.plot({
    width,
    height,
    color: { scheme: "Blues", domain, legend: true },
    y: {label: "Rate (%)", tickFormat: d => `${d}%`, grid: true},
    x: {domain: rateDomain},
    marks: [
      Plot.line(curve, {x: "maturity", y: "rate", stroke: "date"}),
      Plot.dot(curve, {x: "maturity", y: "rate", fill: "date", r: 5, tip: true}),
      Plot.ruleY([0]),
    ]
  });
};
```

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Yield curve rates</h2>
    ${resize((width) => plotRates(flatRates, {width, domain: rateDomain}))}
  </div>
  <div class="card">
    <h2>Yield curve spreads</h2>
    ${resize((width) => plotRates(spreads, {width}))}
  </div>
  <div class="card">
    <h2>Yield curves at three dates in the zoom window</h2>
    ${resize((width) => plotCurve(curveData, {width}))}
  </div>
  <div class="card">
    ${tsZoom({height: 100, initialStartEnd, setStartEnd, marks: rateMarks(allFlatRates)})}
  </div>
</div>


Federal reserve interest rates are a key indicator of the health of the economy. The yield curve is a plot of interest rates at different maturities, and is often used to predict economic downturns. An inverted yield curve, where short-term rates are higher than long-term rates, is often seen as a sign of an impending recession. The Federal Reserve uses interest rates to control inflation and stabilize the economy.
