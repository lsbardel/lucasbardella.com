---
title: Mandelbrot set
description: An interactive zoomable plot of the Mandelbrot set rendered on canvas.
date: 2023-01-08
keywords: d3, mathematics, canvas
toc: false
---

```tsx
import Mandelbrot from "../../components/mandelbrot.js";
import {schemes} from "../../components/palettes.js";
```

An interactive canvas rendering of the [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set).
**Scroll** to zoom, **drag** to pan, **double-click** to reset.

```js
const palette = view(Inputs.select(Object.keys(schemes), {value: "Magma", label: "Palette"}));
```

```tsx
display(<Mandelbrot maxIter={256} palette={palette} />);
```
