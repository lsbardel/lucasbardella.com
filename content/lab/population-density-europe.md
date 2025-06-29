---
title: Population density in Europe
description: A choropleth map visualizing population density in Europe for a selected year using Eurostat data.
theme: dashboard
keywords: eurostat, statistics, europe
date: 2025-06-29
---

```jsx
display(<h2>{year}</h2>);
```

```js
import * as d3 from "d3";
const range = d3.range(2023, 2000, -1).map((v) => v.toString());
const urlParams = new URLSearchParams(window.location.search);
const currentYear = urlParams.get("year") || range[0];
const year = view(Inputs.select(range, { label: "Year", value: currentYear }));
```


```html
<svg id="map"></svg>
```

```js
import eurostatmap from "eurostat-map";
```

```js
if (currentYear !== year) {
  urlParams.set("year", year);
  history.replaceState({}, "", `?${urlParams.toString()}`);
}
```

```js
eurostatmap
  .map("choropleth")
  .width(width)
  .subtitle(year)
  .stat({ eurostatDatasetCode: "demo_r_d3dens", unitText: "people/km²", filters: { TIME: year } })
  .legend({ x: 100, y: 90, title: "Density, people/km²" })
  .zoomExtent([1, 10])
  .build();
```

Using the [eurostat-map](https://github.com/eurostat/eurostat-map) library, this code creates a [choropleth](https://en.wikipedia.org/wiki/Choropleth_map) map of Europe showing population density for a selected year.
