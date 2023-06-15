author: Luca Sbardella
title: Embedding TradingView Charts
slug: tradingview-charts
date: 2023-01-08 16:00
keywords: d3, javascript, mathematics, math, agnesi
description: Adding TradingView charts to a web application is easy with web-components and the @metablock/notebook tool.
image: unsplash-JpflvzEl5cg
hero_photo: unsplash-JpflvzEl5cg
hero_opacity: 0.1
category: visualization

---

<trading-view symbol="NASDAQ:AAPL" theme="auto" aspectratio="80%"></trading-view>

This lab entry extends the [@metablock/notebook](https://www.npmjs.com/package/@metablock/notebook) tool to embed a TradingView chart into the website.

```html
<trading-view symbol="NASDAQ:AAPL" theme="auto" aspectratio="80%"></trading-view>
```
Implementation via a web component:
<github-repo owner="lsbardel" repo="lucasbardella.com" path="app/notebook/tradingview.ts"></github-repo>
