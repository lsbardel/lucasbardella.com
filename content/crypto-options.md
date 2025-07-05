---
title: Pricing Crypto Options
description: Learn how to price crypto options using QuantFlow's powerful tools.
---

```js
import { sparkbar } from "./components/sparkbar.js";
const btc = FileAttachment("./data/options/btc-ts.csv").csv({ typed: true });
const btcSpot = FileAttachment("./data/options/btc-spot.json").json();
const eth = FileAttachment("./data/options/eth-ts.csv").csv({ typed: true });
const ethSpot = FileAttachment("./data/options/eth-spot.json").json();
```

# Pricing Crypto Options

Options are financial derivatives that give the holder the right, but not the obligation, to buy or sell an underlying asset at a predetermined price, called strike, before or at a specified expiration date.
Options can be used to hedge against price volatility or speculate on future price movements.

American options can be exercised at any time before expiration, while European options can only be exercised at expiration.
There are [other type of option styles](https://en.wikipedia.org/wiki/Option_style), such as Bermudan options, which can be exercised at specific dates before expiration, but they are less common in practice.

In this post, I explore how to price crypto **European Options** traded on [deribit](https://www.deribit.com/) exchange using [quantflow](https://github.com/quantmind/quantflow)'s powerful tools.

## Setting up

<a href="https://quantflow.quantmind.com/" target="_blank">
<img src="https://quantflow.quantmind.com/_static/quantflow-light.svg" alt="QuantFlow Logo" width="200">
</a>

To get started, you need to have Python 3.11 or later installed on your machine.
Once you have Python installed, you need to install the `quantflow` package in your environment.
You can do this using pip:

```bash
pip install quantflow[cli,data]
```

That is that! You are now ready to start pricing crypto options using `quantflow`.

## Term Structure

```js
const assetMap = {
  BTC: { ts: btc, spot: btcSpot },
  ETH: { ts: eth, spot: ethSpot },
};
const asset = view(Inputs.select(["BTC", "ETH"], { label: "Asset", value: "ETH" }));
```

The term structures refers to the relationship between the time to expiration and the price of forward (future) contracts.

A forward contract is an agreement to buy or sell an asset at a future date for a price agreed upon today.
In the context of options, the term structure is used to determine the forward price of the underlying asset at different maturities.

```js
const data = assetMap[asset];
const formatDate = d3.timeFormat("%Y %b %d %H:%M:%S");
const fwd = d3.format(",.3f");

display(html`
  <h4>
    ${asset} on <span style="color: #00b4d8">${formatDate(new Date(data.spot.timestamp))}</span>
  </h4>
  <h4>Spot price <span style="color: #00b4d8">${fwd(data.spot.spot)}</span></h4>
`);
```

```js
import * as d3 from "d3";
const formatDate = d3.timeFormat("%Y %b %d");
const fwd = d3.format(",.3f");
const ttm = d3.format(".3f");
const ts = asset === "BTC" ? btc : eth;
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
      rate_percent: (v) => d3.format(".2%")(v * 0.01),
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

The **basis** is the difference between the forward price and the spot price of the underlying asset.
The **rate** is the expected annualized interest rate that one would earn or pay (if negative) when holding the spot asset and shorting the corresponding forward contract until the maturity of the forward contract.

```js
const minRate = d3.min(ts, (d) => +d.rate_percent);
const maxRate = d3.max(ts, (d) => +d.rate_percent);
const minY = minRate - (maxRate - minRate)*0.2;
```

```js
Plot.plot({
  title: `Implied annualized rate for ${asset}`,
  marks: [
    Plot.frame(),
    Plot.areaY(ts, {x: "maturity", y1: minY, y: "rate_percent", fill: "#457b9d", opacity: 0.8}),
    Plot.dot(ts, {x: "maturity", y: "rate_percent", r: 5, fill: "#457b9d", stroke: "white"}),
  ]
})
```

The term structure can be created in [quantflow](https://github.com/quantmind/quantflow) via the following snippet:

```python
import pandas as pd
from quantflow.data.deribit import Deribit

async def fetch_vol_surface(asset: str) -> None:
    async with Deribit() as deribit:
        loader = await deribit.volatility_surface_loader(asset)
        vs = loader.surface()
        ts = vs.term_structure()


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


## Volume vs Open Interest

Volume and open interest are two important metrics in trading that provide insights into market activity and liquidity.
- **Volume** refers to the total number of contracts traded during a specific period, typically a day. It indicates the level of activity and interest in a particular option. It is closely linked to the
[liquidity](https://en.wikipedia.org/wiki/Market_liquidity) of the market, as higher volume generally means more participants are trading the contract, making it easier to enter and exit positions.
- **Open Interest** refers to the total number of outstanding contracts that are held by market participants. In essence, it tracks the number of open positions in the market.
