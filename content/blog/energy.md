---
title: UK Wholesale Energy Prices
description: UK wholesale energy prices are calculated from the day ahead action which runs at 16:45 CET for the following day. The prices are in GBP per MWh.
date: 2024-11-05
keywords: energy, wholesale, uk
---

In the UK, the wholesale electricity market is centered around the day-ahead auctions operating on both an hourly and a half-hourly basis. The day-ahead auction is the primary market for trading electricity in the UK, where market participants submit their bids and offers for the next day's electricity supply and demand.

The UK wholesale electricity market is operated by the National Grid Electricity System Operator (ESO) and the Elexon company, which manages the Balancing and Settlement Code (BSC). The market operates on a competitive basis, with multiple participants including generators, suppliers, and traders.

The data is reported by [EPEX Spot](https://www.epexspot.com/en/market-results), the European Power Exchange which operates physical electricity markets for the largest trading community in Europe.

```js
const prices = FileAttachment("../../data/wholesale/uk_power.csv").csv({typed: true});
const daily = FileAttachment("../../data/wholesale/daily.csv").csv({typed: true});
```


```js
const wholesale = (data, {width, height} = {}) => {
  return Plot.plot({
    width,
    height,
    color: {legend: true},
    y: {
      grid: true,
    },
    marks: [
      Plot.dot(data, {x: "delivery_date", y: "price", stroke: "price", tip: true}),
      Plot.ruleY([0]),
    ]
  });
}
const london = (data, {width, height} = {}) => {
  return Plot.plot({
    width,
    height,
    color: {legend: true},
    y: {
      grid: true,
    },
    marks: [
      Plot.dot(data, {x: "trading_date", y: "london", fill: "london", tip: true}),
      Plot.ruleY([0]),
    ]
  });
}
```


<div class="grid grid-cols-1">
  <div class="card">
    <h2>UK Wholesale Energy Prices</h2>
    ${resize((width) => wholesale(prices, {width}))}
  </div>
</div>


Daily prices are calculated as the daily average of the day ahead action.

<div class="grid grid-cols-1">
  <div class="card">
    <h2>UK Daily Energy Prices</h2>
    ${resize((width) => london(daily, {width}))}
  </div>
</div>
