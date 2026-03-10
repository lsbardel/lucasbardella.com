---
title: Pi Approximation
description: Pi approximation up to 5 decimal places using a Sobol low-discrepancy sequence. D3 is used for the animation.
date: 2014-11-20
keywords: pi, animation, svg, d3, mathematics
toc: false
---

```tsx
import Pi from "../../components/pi.js";
display(<Pi />);
```

π is approximated via Monte Carlo: random points are drawn inside a square enclosing a unit circle.
The ratio of points landing inside the circle converges to π/4.
A [Sobol sequence](https://en.wikipedia.org/wiki/Sobol_sequence) is used instead of pseudo-random numbers for faster convergence.
