---
title: Potential flow
description: The classic closed form solution for incompressible flow past a two-dimensional cylinder.
date: 2014-08-11
keywords: flow, cylinder, incompressible, mathematics, fluid-dynamics, physics
toc: false
---

```tsx
import Cylinder from "../../components/cylinder.js";
import {schemes} from "../../components/palettes.js";
```

The image represents the stream function of an [incompressible inviscid flow past a cylinder](https://en.wikipedia.org/wiki/Potential_flow_around_a_circular_cylinder).
The stream function has a closed form solution in polar coordinates:

```tex
\psi\left(r,\theta\right) = V_{\infty} \left(r - \frac{a^2}{r}\right) \sin{\theta}
```

where *a* is the cylinder radius.

<div class="grid grid-cols-2" style="row-gap: 0">

```js
const radius = view(Inputs.range([0.05, 0.4], {step: 0.01, value: 0.1, label: "Cylinder radius"}));
const ny = view(Inputs.range([5, 60], {step: 1, value: 30, label: "Streamlines"}));
const palette = view(Inputs.select(Object.keys(schemes), {value: "RdBu", label: "Palette"}));
```
```js
const nParticles = view(Inputs.range([100, 5000], {step: 10, value: 1000, label: "Particles"}));
const particleRadius = view(Inputs.range([1, 8], {step: 0.5, value: 3, label: "Particle radius"}));
```
</div>

```tsx
display(<Cylinder radius={radius} ny={ny} nParticles={nParticles} particleRadius={particleRadius} palette={palette} />);
```

The pressure field is obtained from Bernoulli's equation. The velocity components in polar coordinates are:

```tex
v_r = V_{\infty}\left(1 - \frac{a^2}{r^2}\right)\cos\theta, \qquad
v_\theta = -V_{\infty}\left(1 + \frac{a^2}{r^2}\right)\sin\theta
```

giving the pressure coefficient:

```tex
C_p = 1 - \frac{v_r^2 + v_\theta^2}{V_{\infty}^2}
    = 1 - \left(1 - \frac{a^2}{r^2}\right)^2\cos^2\theta
        - \left(1 + \frac{a^2}{r^2}\right)^2\sin^2\theta
```

On the cylinder surface (*r* = *a*) this reduces to:

```tex
C_p\big|_{r=a} = 1 - 4\sin^2\theta
```
