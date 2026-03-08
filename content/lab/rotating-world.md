---
title: Rotating world
description: An animated rotating globe rendered on canvas using d3-geo and orthographic projection.
date: 2014-10-30
keywords: d3, geo, canvas, world, map
toc: false
---

```tsx
import RotatingWorld from "../../components/rotating-world.js";
const world = FileAttachment("../../data/world-110m.json").json();
```

An animated globe using [d3-geo](https://d3js.org/d3-geo) with an orthographic projection, rendered on canvas.

```js
const speed = view(Inputs.range([0, 10], {step: 0.5, value: 2, label: "Speed (rpm)"}));
```

```tsx
display(<RotatingWorld world={world} speed={speed} />);
```
