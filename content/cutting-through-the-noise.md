---
title: Cutting through the noise
description: A technical comparison of SuperSmoother, Exponentially Weighted Moving Average (EWMA), and Kalman Filter in high-frequency trading.
date: 2026 January 31
keywords: programming, hft, high-frequency trading, filtering, supersmoother, ewma, kalman filter
---

In high-frequency trading (HFT), filtering techniques are essential for extracting meaningful signals from noisy market data. This article explores three popular filtering methods: SuperSmoother, Exponentially Weighted Moving Average (EWMA), and Kalman Filter. We will compare their effectiveness in reducing noise while preserving important price movements.

## Data Loading

First, let's load the financial data we'll use for our analysis:

```js
// Load the financial data archive
const financialData = FileAttachment("data/cutting-through-noise.zip");
```

```js
// Extract stock price data for major tech companies
const stockSymbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "META", "TSLA", "NVDA"];
const stockPrices = {};

for (const symbol of stockSymbols) {
  stockPrices[symbol] = financialData.csv(`${symbol}-prices.csv`, {typed: true});
}
```

```js
// Load market indices for comparison
const indices = {
  sp500: financialData.csv("GSPC-prices.csv", {typed: true}),
  nasdaq: financialData.csv("IXIC-prices.csv", {typed: true}),
  vix: financialData.csv("VIX-prices.csv", {typed: true})
};
```

```js
// Load fundamental ratios for analysis
const fundamentalData = {};

for (const symbol of stockSymbols) {
  fundamentalData[symbol] = financialData.csv(`${symbol}-ratios.csv`, {typed: true});
}
```

Now we have access to comprehensive financial data including historical prices and fundamental ratios for our filtering analysis.
