---
title: Credits
description: A thank you to the open-source authors and communities that make this site possible
toc: false
---

```tsx
import { PageHeader } from "./components/image.js";
const __images = FileAttachment("./data/images.json").json();
```

<div class="outer-placeholder" style="padding-top: 40%;">
<div class="inner-placeholder">

```tsx
display(
  <PageHeader
    title="Credits"
    subtitle="None of this exists without the open-source community. Thank you."
    urls={__images.thanks}
    opacity={0.5}
    blur="blur-sm"
  />
);
```
</div>
</div>

<h1 class="sr-only">Credits</h1>

This website is the product of a lot of great open-source work. I believe in giving credit where it is due, so this page lists every major library and framework that powers the site, from the static site generator down to the smallest utility.

## Framework and Styling

[Observable Framework](https://observablehq.com/framework/) is the foundation of the site. It is an open-source static site generator designed for data apps, dashboards, and interactive reports. It brings together Markdown, JavaScript, and reactive inputs into a coherent authoring experience that makes building data-driven pages straightforward.

[Tailwind CSS](https://tailwindcss.com/) handles all the styling. Its utility-first approach keeps the CSS footprint small and makes it easy to build consistent layouts without writing custom stylesheets.

## Visualizations and Data

[D3.js](https://d3js.org/) is the backbone of most interactive graphics on the site. It provides low-level primitives for binding data to SVG, computing layouts, projections, and scales — the building blocks for everything from financial charts to geometric logo generators.

[Observable Plot](https://observablehq.com/plot/) sits on top of D3 and provides a higher-level grammar for statistical charts. It handles the common cases quickly and composes well with D3 for custom work.

[d3-quant](https://github.com/quantmind/d3-quant) extends D3 with quantitative finance utilities.

[TradingView Charting Library](https://www.tradingview.com/charting-library-docs/) powers the interactive financial charts, providing professional-grade candlestick charts, technical indicators, and real-time data streaming capabilities.

[eurostat-map](https://github.com/eurostat/eurostat-map.js) renders choropleth maps of European countries using Eurostat data, making it easy to visualise regional statistics across the EU.

[TopoJSON](https://github.com/topojson/topojson) provides compact geographic topology encoding and the client-side utilities to convert it into GeoJSON for rendering with D3.

## UI and Utilities

[React](https://react.dev/) is used for component-based rendering across the interactive lab experiments, managing state and side effects for canvas and SVG animations.

[JSZip](https://stuk.github.io/jszip/) enables in-browser ZIP file creation, used in the logo generators to bundle SVG and multi-resolution PNG exports into a single download.

[HTL](https://github.com/observablehq/htl) provides hypertext literal templating for building safe, composable HTML fragments directly in JavaScript.

## Python Tooling

Behind the scenes, all data fetching and processing is handled by Python. [quantflow](https://github.com/quantmind/quantflow) is the primary library for financial data access and quantitative analysis. [pandas](https://pandas.pydata.org/) handles data manipulation and transformation before the data reaches the browser.

[aio-fluid](https://github.com/quantmind/aio-fluid) provides async utilities for backend services, including the task scheduler used for data pipeline jobs. [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) handles communication with AWS S3 for storing and retrieving data files.

[foamlib](https://github.com/gerlero/foamlib) is the Python interface for [OpenFOAM](https://openfoam.org/), used to configure and run the CFD simulations featured in the lab section.

## Source Code

The full source code for this website is available on [GitHub](https://github.com/lsbardel/lucasbardella.com).
