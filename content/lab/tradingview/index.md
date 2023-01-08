author: Luca Sbardella
title: Embedding TradingView Charts
slug: tradingview-charts
date: 2023-01-08 16:00
keywords: d3, javascript, mathematics, math, agnesi
description: Adding TradingView charts to a web application is easy with the @metablock/notebook tool.
image: unsplash-JpflvzEl5cg
hero_photo: JpflvzEl5cg
hero_opacity: 0.1
category: visualization

---

<tradingview symbol="NASDAQ:AAPL" theme="dark" aspectratio="80%" copyright></tradingview>

This lab entry extends the [@metablock/notebook](https://www.npmjs.com/package/@metablock/notebook) tool to embed a TradingView chart into the website.

```html
<tradingview symbol="NASDAQ:AAPL" theme="dark" aspectratio="80%" copyright></tradingview>
```
Implementation via a markdown plugin:
<github owner="lsbardel" repo="lucasbardella.com" path="app/notebook/tradingview.ts" lang="ts"></github>
