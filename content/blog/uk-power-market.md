---
title: UK Wholesale Energy Prices
description: UK wholesale energy prices are calculated from the day ahead action which runs at 16:45 CET for the following day. The prices are in GBP per MWh.
date: 2024-11-05
keywords: energy, wholesale, uk
private: true
---

The UK wholesale electricity market is operated by the National Grid Electricity System Operator (ESO) and the Elexon company, which manages the Balancing and Settlement Code (BSC). The market operates on a competitive basis, with multiple participants including generators, suppliers, and traders.

The [European Power Exchange (EPEX)](https://www.epexspot.com/en/market-results) and [Nord Pool](https://www.nordpoolgroup.com) run a series of markets for trading power. These are defined by when they run, what delivery periods they cover, and how granular these are. Most of these markets follow a pay-as-clear auction format, where participants pay the same price. The continuous intraday market is an exception and runs as a pay-as-bid order book, with trades priced individually.

## Day Ahead Market

In the UK, the wholesale electricity market is centered around the day-ahead auctions operating on both an hourly and a half-hourly basis. The day-ahead auction is the primary market for trading electricity in the UK, where market participants submit their bids and offers for the next day's electricity supply and demand.

While both types of auctions play a role, the hourly day-ahead auctions (specifically the EPEX 60-minute auction closing around 9:20 GMT and the [Nord Pool N2EX](https://data.nordpoolgroup.com/auction/n2ex/prices) Hourly auction closing around 9:50 GMT) are generally considered the most important for these reasons:

1. **Higher Liquidity** - These auctions typically handle significantly larger volumes of traded electricity compared to the later 30-minute auction. High liquidity means more buyers and sellers are participating, leading to prices that are generally seen as more robust and representative of the market's view at that time.

2. **Primary Reference Price** - The results from these hourly auctions are widely used as the key benchmark or reference price for GB day-ahead wholesale electricity. For instance, the official Intermittent Market Reference Price (IMRP) used for settling Contracts for Difference (CfDs) is calculated using a volume-weighted average of the prices from both the N2EX and EPEX hourly day-ahead auctions.

3. **Setting the Baseline** - Running earlier in the day, these auctions establish the initial large-scale positions and price signals for market participants for the following day. They form the foundation upon which later adjustments (in the 30-minute auction or intraday markets) are made.

4. **Broader Exchange Coverage** - Hourly auctions are offered by both major exchanges active in the UK (Nord Pool/N2EX and EPEX SPOT), potentially reflecting broader market activity compared to the EPEX-only 30-minute auction

While the 30-minute auction is valuable for allowing participants to fine-tune their positions closer to the delivery time based on updated forecasts and align with the 30-minute settlement periods.

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
