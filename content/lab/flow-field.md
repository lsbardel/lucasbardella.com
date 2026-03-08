---
title: Flow Field
description: Perlin noise flow field visualization — thousands of particles tracing the invisible currents of a turbulent vector field.
date: 2026-03-08
toc: false
keywords: art, generative, perlin, flow field, fluid dynamics
---


```tsx
import FlowField from "../../components/flow-field.js";
import {schemes} from "../../components/palettes.js";
```

Each particle follows the local angle of the field, leaving a faint trail — the aggregate of countless invisible forces made visible over time.

This was my first visualization done with the help of the [lab-skill](https://github.com/lsbardel/lucasbardella.com/tree/main/.github/instructions/lab-instructions.md) for
AI agents.

<div class="grid grid-cols-2" style="row-gap: 0">

```js
const particleCount = view(Inputs.range([500, 8000], {step: 500, value: 3000, label: "Particles"}));
const speed = view(Inputs.range([0.3, 4], {step: 0.1, value: 1.2, label: "Speed"}));
const noiseScale = view(Inputs.range([0.001, 0.02], {step: 0.0005, value: 0.0035, label: "Noise scale"}));
```
```js
const trailFade = view(Inputs.range([1, 30], {step: 1, value: 10, label: "Trail length"}));
const scheme = view(Inputs.select(Object.keys(schemes), {value: "Viridis", label: "Palette"}));
const background = view(Inputs.select(["transparent", "dark", "light"], {value: "transparent", label: "Background"}));
```

</div>

```tsx
display(<FlowField particleCount={particleCount} speed={speed} noiseScale={noiseScale} trailFade={trailFade} colors={schemes[scheme]} background={({dark: "#0a0a0f", light: "#f5f5f5", transparent: "transparent"})[background]} />);
```
