author: Luca Sbardella
title: Observable Plot
slug: noise
date: 2023-01-08 16:00
keywords: d3, javascript, mathematics, math, agnesi
description: Adding TradingView charts to a web application is easy with web-components and the @metablock/notebook tool.
image: unsplash-JpflvzEl5cg
hero_photo: JpflvzEl5cg
hero_opacity: 0.1
category: visualization
private: true

---

```md
```js
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot/+esm";

class Plot extends HTMLElement {
  connnectedCallback() {
    const options = {
      height: 500,
      marks: [
        Plot.raster({
          fill: mandelbrot,
          pixelSize: 1 / devicePixelRatio,
          x1: -2,
          x2: 1,
          y1: -1.164,
          y2: 1.164,
        }),
      ],
    };
    this.appendChild(Plot.plot(options));
  }
}

customElements.define("plot-view", PlotView);
```
```
