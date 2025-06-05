---
title: Mandelbrot set
description: A raster plot of the Mandelbrot set using Observable Plot.
date: 2023-01-08
keywords: d3, plot, mathematics
---

```js
const mandelbrot = (x, y) => {
  for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
    [zr, zi] = [zr * zr - zi * zi + x, 2 * zr * zi + y];
    if (zr * zr + zi * zi > 4) return n;
  }
};
display(
  Plot.raster({ fill: mandelbrot, x1: -2, x2: 1, y1: -1.164, y2: 1.164 }).plot({ aspectRatio: 1 }),
);
```
