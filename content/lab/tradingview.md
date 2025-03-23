---
title: TradingView Charts
date: 2023-01-08
description: Adding TradingView charts to a web application is easy with observable framework
keywords: visualization
---


```tsx
import {TradingViewChart} from "../../components/tradingview.js";
display(<TradingViewChart symbol="NASDAQ:AAPL" theme="dark" aspectRatio="80%" />);
```

Embedding TradingView charts is easy with the [TradingView](https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/) widgets. The `symbol` prop is used to specify the symbol to be displayed. The `theme` prop is used to specify the theme of the chart. The `aspectRatio` prop is used to specify the aspect ratio of the chart.

```javascript
display(<TradingViewChart symbol="NASDAQ:AAPL" theme="dark" aspectRatio="80%"/>);
```
