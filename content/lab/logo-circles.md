---
title: Geometric SVG Logo Generator
description: Free interactive SVG logo generator built with D3.js. Design geometric logos from overlapping circles with rotational symmetry — export as SVG or PNG.
date: 2026-03-13
toc: false
keywords: art, generative, logo, d3, svg, geometry, design
private: true
---

```tsx
import LogoCircles from "../../components/logo/circles.js";
```

## How it works

Every professional logo begins as a geometric idea. This generator explores one of the simplest: take `n` circles of radius `r`, place each centre at distance `r` from the origin, and let them overlap. Because every circle passes through the origin, the intersections are predictable and the resulting silhouette has exact `n`-fold rotational symmetry.

## Controls

From that single construction you get a surprising range of marks depending on what you keep and what you cut away. The **clip** controls trim the shape to its outer boundary or hollow out its centre. **Fill petals** shades the lens-shaped intersection between each pair of adjacent circles — the building block of countless natural and designed forms, from Islamic geometric patterns to modern brand marks. **Show chords** adds the straight lines that connect each circle's outer intersection points, forming an inscribed polygon and introducing a harder, more architectural feeling.

Tune the controls in real time and download the result as SVG or PNG.

<div class="grid grid-cols-2" style="row-gap: 0">

```js
const petals = view(Inputs.range([3, 12], {step: 1, value: 8, label: "Petals"}));
const rotation = view(Inputs.range([0, 360], {step: 1, value: 0, label: "Rotation (deg)"}));
```

```js
const strokeColor = view(Inputs.color({value: "#97d8eb", label: "Color"}));
const strokeWidth = view(Inputs.range([0.5, 10], {step: 0.5, value: 3, label: "Stroke width"}));
const opacity = view(Inputs.range([0, 1], {step: 0.05, value: 1, label: "Opacity"}));
```

```js
const clip = view(Inputs.select(["none", "outer", "inner", "petals"], {value: "none", label: "Clip mode"}));
const innerRadius = view(Inputs.range([0, 1], {step: 0.01, value: 0.675, label: "Inner radius"}));
const fillPetals = view(Inputs.toggle({label: "Fill petals", value: false}));
const showChords = view(Inputs.toggle({label: "Show chords", value: false}));
```

</div>

```tsx
display(<LogoCircles petals={petals} rotation={rotation} strokeColor={strokeColor} strokeWidth={strokeWidth} clip={clip} innerRadius={innerRadius} fillPetals={fillPetals} showChords={showChords} opacity={opacity} size={600} />);
```
