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
const prices = await FileAttachment("../../data/cutting-through-noise.zip").zip()
  .then(z => z.file("prices.csv").csv({typed: true}));
```
