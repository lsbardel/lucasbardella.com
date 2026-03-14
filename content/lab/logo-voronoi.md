---
title: Voronoi Logo Generator
description: Free interactive SVG logo generator built with D3.js. Design geometric logos from Voronoi diagrams and Delaunay triangulations — export as SVG or PNG.
date: 2026-03-13
toc: false
keywords: art, generative, logo, d3, svg, voronoi, delaunay, geometry, design
private: true
---

```tsx
import VoronoiLogo from "../../components/logo/voronoi.js";
```

## How it works

A [Voronoi diagram](https://en.wikipedia.org/wiki/Voronoi_diagram) partitions the plane into regions — each region contains all points closer to one seed than to any other. The dual graph, the [Delaunay triangulation](https://en.wikipedia.org/wiki/Delaunay_triangulation), connects seeds whose Voronoi cells share an edge. Together they produce organic, cell-like structures that appear throughout nature: giraffe markings, dragonfly wings, foam bubbles.

The seed arrangement drives the character of the result. **Phyllotaxis** (the golden-angle spiral) gives the dense, balanced packing found in sunflowers. **Ring** places seeds on concentric circles for a more regular, radial feel. **Grid** clips a square lattice to a circle. **Random** uses a seeded generator so you can explore the space reproducibly.

<div class="grid grid-cols-2" style="row-gap: 0">

```js
const seeds = view(Inputs.range([5, 120], {step: 1, value: 40, label: "Seeds"}));
const pattern = view(Inputs.select(["phyllotaxis", "random", "ring", "grid"], {value: "phyllotaxis", label: "Pattern"}));
```

```js
const strokeColor = view(Inputs.color({value: "#10a37f", label: "Color"}));
const strokeWidth = view(Inputs.range([0, 4], {step: 0.5, value: 1, label: "Stroke width"}));
const opacity = view(Inputs.range([0, 1], {step: 0.05, value: 1, label: "Opacity"}));
```

```js
const showVoronoi = view(Inputs.toggle({label: "Show Voronoi", value: true}));
const showDelaunay = view(Inputs.toggle({label: "Show Delaunay", value: false}));
const showPoints = view(Inputs.toggle({label: "Show points", value: false}));
const showBoundary = view(Inputs.toggle({label: "Show boundary", value: true}));
```

```js
const pointRadius = view(Inputs.range([1, 6], {step: 0.5, value: 2, label: "Point radius"}));
const randomSeed = view(Inputs.range([0, 100], {step: 1, value: 42, label: "Random seed"}));
```

```js
const fillCells = view(Inputs.toggle({label: "Fill cells", value: false}));
const fillDensity = view(Inputs.range([0, 1], {step: 0.05, value: 0.5, label: "Fill density"}));
const fillSeed = view(Inputs.range([0, 100], {step: 1, value: 7, label: "Fill seed"}));
```

```js
import {schemes} from "../../components/palettes.js";
const palette = view(Inputs.select(Object.keys(schemes), {value: "Observable10", label: "Palette"}));
```

</div>

```tsx
display(<VoronoiLogo seeds={seeds} pattern={pattern} strokeColor={strokeColor} strokeWidth={strokeWidth} opacity={opacity} showVoronoi={showVoronoi} showDelaunay={showDelaunay} showPoints={showPoints} showBoundary={showBoundary} pointRadius={pointRadius} randomSeed={randomSeed} fillCells={fillCells} fillDensity={fillDensity} fillSeed={fillSeed} palette={palette} size={600} />);
```
