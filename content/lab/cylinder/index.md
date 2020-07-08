author: Luca Sbardella
title: Potential flow around a cylinder
slug: potential_flow_around_a_cylinder
date: 2014-08-11 14:50
keywords: flow, cylinder, incompressible, javascript, mathematics, math, fluid-dynamics, physics, d3
description: The classic closed form solution for incompressible flow past a two-dimensional cylinder
image: {{ assetUrl }}/lab/cylinder.png
category: visualization

---

<script src="{{ bundleUrl }}/lab/potential_flow_around_a_cylinder/transform.js" aspectratio="70%"></script>

The image represents the stream function of an incompressible inviscid flow past a cylinder.
The stream function for this type of flow has a closed form solution in polar coordinates

```math
\psi\left(r,\theta\right) = V_{\infty} \left(\frac{a^2}{r} - r\right) \sin{\theta}
```

where `a` is the cylinder radius.

Visialization using [d3](https://d3js.org/).
Code available [here]({{ bundleUrl }}/lab/potential_flow_around_a_cylinder/transform.js).
