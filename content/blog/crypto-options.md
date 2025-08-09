---
title: Pricing Crypto Options
date: 2025-08-09
description: Learn how to price crypto options using python QuantFlow's powerful tools and Deribit API.
keywords: crypto, options, pricing, quantflow, python
---

```js
import { sparkbar } from "../../components/sparkbar.js";
import { OptionRow } from "../../components/OptionTable.js";
const btc = FileAttachment("../../data/options/btc-ts.csv").csv({ typed: true });
const btcSpot = FileAttachment("../../data/options/btc-spot.json").json();
const btcOps = FileAttachment("../../data/options/btc-ops.csv").csv({ typed: true });
const eth = FileAttachment("../../data/options/eth-ts.csv").csv({ typed: true });
const ethSpot = FileAttachment("../../data/options/eth-spot.json").json();
const ethOps = FileAttachment("../../data/options/eth-ops.csv").csv({ typed: true });
```

# Pricing Crypto Options

Options are financial derivatives that give the holder the right, but not the obligation, to buy or sell an underlying asset at a predetermined price, called strike, before or at a specified expiration date.
Options can be used to hedge against price volatility or speculate on future price movements.

American options can be exercised at any time before expiration, while European options can only be exercised at expiration.
There are [other type of option styles](https://en.wikipedia.org/wiki/Option_style), such as Bermudan options, which can be exercised at specific dates before expiration, but they are less common in practice.

In this post, I explore how to price crypto **European Options** traded on [deribit](https://www.deribit.com/) exchange using [quantflow](https://github.com/quantmind/quantflow)'s powerful tools.

## Setting up

<a href="https://quantflow.quantmind.com/" target="_blank">
<img src="https://quantflow.quantmind.com/_static/quantflow-light.svg" alt="QuantFlow Logo" width="200"">
</a>

To get started, you need to have [Python 3.11 or later](https://www.python.org/) installed on your machine.
Once you have that, you need to install the `quantflow` package in your environment.
You can do this using pip:

```bash
pip install quantflow[cli,data]
```

That is that! You are now ready to start pricing crypto options using `quantflow`.

## Term Structure

```js
const assetMap = {
  BTC: { ts: btc, spot: btcSpot, ops: btcOps },
  ETH: { ts: eth, spot: ethSpot, ops: ethOps },
};
const asset = view(Inputs.select(["BTC", "ETH"], { label: "Asset", value: "ETH" }));
```

The term structures refers to the relationship between the time to expiration and the price of forward (future) contracts.

A forward contract (called future when traded on an exchange) is an agreement to buy or sell an asset at a future date for a price agreed upon today.
In the context of options, the term structure is used to determine the forward price of the underlying asset at different maturities.

It is an important concept in options pricing, as it indicates how the price of the underlying asset is expected to change over time.
It is important to understand that this expectation is not a prediction, it is
the [risk-neutral expectation](https://en.wikipedia.org/wiki/Risk-neutral_measure) of the future price of the underlying asset.

```js
import * as d3 from "d3";
const data = assetMap[asset];
const formatTime = d3.timeFormat("%d %b %Y %H:%M:%S");
const formatDate = d3.timeFormat("%d %b %Y");
const fwd = d3.format(",.2f");
const ttm = d3.format(".3f");
```

```js
display(html`
  <h4>
    ${asset} on <span style="color: #00b4d8">${formatTime(new Date(data.spot.timestamp))}</span>
  </h4>
  <h4>Spot price <span style="color: #00b4d8">${fwd(data.spot.spot)}</span></h4>
`);
```

```js
const ts = data.ts;
view(
  Inputs.table(ts, {
    header: {
      maturity: "Maturity",
      ttm: "Time to Maturity",
      forward: "Forward Price",
      basis: "Basis",
      rate_percent: "Rate (%)",
      open_interest: "Open Interest",
      volume: "Volume",
    },
    format: {
      maturity: (v) => formatDate(new Date(v)),
      ttm: (v) => ttm(v),
      forward: (v) => fwd(v),
      basis: (v) => fwd(v),
      rate_percent: sparkbar(
        d3.max(ts, (d) => d.rate_percent),
        "#457b9d",
        (v) => d3.format(".3%")(v * 0.01),
      ),
      open_interest: sparkbar(
        d3.max(ts, (d) => d.open_interest),
        "#457b9d",
      ),
      volume: sparkbar(
        d3.max(ts, (d) => d.volume),
        "#9b2226",
      ),
    },
  }),
);
```

The **basis** is the difference between the forward/future price and the spot/perpetual price of the underlying asset.
The **rate** is the expected annualized interest rate that one would earn or pay (if negative) when holding the spot asset and shorting the corresponding forward contract until the maturity of the forward contract.

```js
const minRate = d3.min(ts, (d) => +d.rate_percent);
const maxRate = d3.max(ts, (d) => +d.rate_percent);
const minY = minRate - (maxRate - minRate) * 0.2;
```

```html
<svg height="0" width="0" style="position:absolute;">
  <defs>
    <linearGradient id="rate-gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d5ec63ff" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#d5ec63ff" stop-opacity="0" />
    </linearGradient>
  </defs>
</svg>
```

```js
display(
  Plot.plot({
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
          fontSize: "14",
          format: {
            x: (d) => formatDate(new Date(d)),
            y: (d) => d3.format(".2%")(d * 0.01),
          },
        },
      }),
    ],
  }),
);
```

The term structure can be created in [quantflow](https://github.com/quantmind/quantflow) via the following snippet:

```python
import pandas as pd
from quantflow.options.surface import VolSurface
from quantflow.data.deribit import Deribit


async def fetch_vol_surface(asset: str) -> VolSurface:
    async with Deribit() as deribit:
        loader = await deribit.volatility_surface_loader(asset)
        return loader.surface()


async def fetch_term_structure(asset: str) -> pd.DataFrame:
    vs = await fetch_vol_surface(asset)
    return vs.term_structure()
```

## Implied Volatility

Implied volatility is a standardized measure of the market's expectation of the future volatility of the underlying asset. It is derived from the market price of an option using the [Black-Scholes](https://en.wikipedia.org/wiki/Black-Scholes_model) model.

### Moneyness

One imporatnt aspect of the implied volatility charts is the use of [moneyness](https://en.wikipedia.org/wiki/Moneyness) as the x-axis in order to normalize the volatility across different strikes and maturities.
There are different ways to define moneyness, but the most common one is defined as:

```tex
\begin{align*}
\text{m} = \frac{1}{\sqrt{T}}\log{\frac{K}{F}}
\end{align*}
```

where ${tex`K`} is the strike price, ${tex`F`} is the forward price of the underlying asset and ${tex`T`} is the time to maturity in years.

```js
const uniqueMaturities = new Set(data.ops.map((d) => formatDate(d.maturity)));
const uniqueDates = Array.from(uniqueMaturities)
  .map((d) => new Date(d))
  .sort((a, b) => a - b);
const maturities = ["All", ...uniqueDates.map((d) => formatDate(d))];
const selectedMaturity = view(
  Inputs.select(maturities, {
    label: "Maturity",
  }),
);
```

```js
const filteredOps =
  selectedMaturity === "All"
    ? data.ops
    : data.ops.filter((d) => formatDate(d.maturity) === selectedMaturity);
const ops = filteredOps.map(({ moneyness, ...keep }) => keep);
```

```js
const maxVolume = d3.max(ops, (d) => d.volume);
const radius = d3.scaleSqrt([0, maxVolume], [2, 30]);

display(
  Plot.plot({
    width,
      title: `Implied Volatility Smile for ${
        selectedMaturity === "All" ? "All Maturities" : formatDate(new Date(selectedMaturity))
      }`,
      x: {
        label: "Moneyness",
        grid: true,
        labelFontSize: 14,
      },
      y: {
        label: "Implied Volatility",
        tickFormat: (v) => d3.format(".0%")(v),
        grid: true,
        labelFontSize: 14,
      },
      color: {
        legend: true,
        domain: ["Bid", "Ask"],
        range: ["#228435ff", "#af1a06ff"],
        label: "Option Type",
      },
      marks: [
        Plot.dot(ops, {
          x: "moneyness_ttm",
          y: "implied_vol",
          r: (d) => radius(d.volume),
          fill: (d) => d.side === "bid" ? "#228435ff" : "#af1a06ff",
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
    })
);
```

The size of the dots is proportional to the volume of the options, which gives an idea of the liquidity of the options at different strikes and maturities.

```js
const row = view(
  Inputs.table(ops, {
    header: {
      strike: "Strike",
      maturity: "Maturity",
      ttm: "Time to Maturity",
      moneyness_ttm: "Moneyness",
      implied_vol: "IV",
      volume: "Volume",
      open_interest: "Open Interest",
    },
    format: {
      maturity: (v) => formatDate(new Date(v)),
      ttm: (v) => ttm(v),
      moneyness: (v) => fwd(v),
      implied_vol: (v) => d3.format(".2%")(v),
    },
    height: 400,
    multiple: false,
  }),
);
```

```jsx
if (row) {
  display(<OptionRow asset={asset} option={row} />);
}
```

## Volume vs Open Interest

Volume and open interest are two important metrics in trading that provide insights into market activity and liquidity.

- **Volume** refers to the total number of contracts traded during a specific period, typically a day. It indicates the level of activity and interest in a particular option. It is closely linked to the
  [liquidity](https://en.wikipedia.org/wiki/Market_liquidity) of the market, as higher volume generally means more participants are trading the contract, making it easier to enter and exit positions.
- **Open Interest** refers to the total number of outstanding contracts that are held by market participants. In essence, it tracks the number of open positions in the market.

While both metrics measure market activity, they tell different stories:

- **Volume** is a measure of turnover. It can be high even if open interest is low, for example, if the same contracts are being traded back and forth frequently within a day (day trading).
- **Open Interest** is a measure of the total number of active positions. It tells us how much money is committed to a particular option for future.

The real power comes from analyzing volume and open interest together. Their relationship can provide strong clues about the market's conviction and the potential for a trend to continue or reverse.

Here’s a simple guide to interpreting the four possible scenarios:

<style>
  .interpretation-table {
    font-size: 1em;
  }
</style>

<table class="interpretation-table">
  <thead>
    <tr>
      <th>Volume</th>
      <th>Open Interest</th>
      <th>Interpretation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Up</strong></td>
      <td><strong>Up</strong></td>
      <td><strong>Strong Trend:</strong> New money is flowing into the market, creating new positions. This is a healthy sign that the current price trend is strong and likely to continue.</td>
    </tr>
    <tr>
      <td><strong>Up</strong></td>
      <td><strong>Down</strong></td>
      <td><strong>Potential Reversal:</strong> High volume shows lots of activity, but falling open interest means traders are closing their existing positions. This often signals the end of a trend, as participants are taking profits or cutting losses.</td>
    </tr>
    <tr>
      <td><strong>Down</strong></td>
      <td><strong>Up</strong></td>
      <td><strong>Stalling Market:</strong> New positions are being opened, but with little volume or conviction. The market may be consolidating or losing momentum.</td>
    </tr>
    <tr>
      <td><strong>Down</strong></td>
      <td><strong>Down</strong></td>
      <td><strong>Weakening Trend:</strong> Low volume and closing positions indicate that traders are losing interest. The current trend is likely weakening and becoming exhausted.</td>
    </tr>
  </tbody>
</table>

By monitoring both volume and open interest, traders can gain a deeper understanding of market dynamics, confirm the strength of a trend, and be better prepared for potential reversals.
