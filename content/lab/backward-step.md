---
title: Turbulent Backward-Facing Step
description: OpenFOAM simulation of turbulent flow over a backward-facing step — a classic benchmark for separated flow and turbulence modelling.
date: 2026-03-11
keywords: cfd, openfoam, fluid-dynamics, turbulence, k-epsilon, simpleFoam, foamlib
toc: false
private: true
---

```tsx
import BackwardStep from "../../components/cfd/backward-step.js";
import {schemes} from "../../components/palettes.js";
import {meshFields2d} from "../../components/cfd/mesh2d.js";

const data = await FileAttachment("../../data/backward-step.zip").zip();
const {mesh, times} = meshFields2d(
  await data.file("mesh.json").json(),
  await data.file("fields.json").json()
);
```

Flow separates at the step corner and reattaches downstream — the recirculation zone is the defining feature of this benchmark. Colour shows velocity magnitude; particles trace the local flow direction.

<div class="grid grid-cols-2" style="row-gap: 0">

```js
const nParticles = view(Inputs.range([200, 3000], {step: 100, value: 800, label: "Particles"}));
const particleRadius = view(Inputs.range([1, 5], {step: 0.5, value: 2, label: "Particle radius"}));
```
```js
const palette = view(Inputs.select(Object.keys(schemes), {value: "Plasma", label: "Palette"}));
const field = view(Inputs.radio(["U", "p"], {value: "U", label: "Field"}));
const showGrid = view(Inputs.toggle({label: "Show grid", value: false}));
const showContours = view(Inputs.toggle({label: "Show contours", value: false}));
const showStreamlines = view(Inputs.toggle({label: "Show streamlines", value: false}));
```

</div>

```tsx
display(<BackwardStep mesh={mesh} times={times} nParticles={nParticles} particleRadius={particleRadius} palette={palette} field={field} showGrid={showGrid} showContours={showContours} showStreamlines={showStreamlines} />);
```

The flow enters from the left through a narrow channel (height **H = 25.4 mm**), then expands abruptly into a channel twice as tall. At Reynolds number **Re ≈ 25,400** the flow is turbulent, solved here with the **k-ε** model and the steady-state SIMPLEC algorithm ([OpenFOAM v13 tutorial](https://doc.cfd.direct/openfoam/user-guide-v13/backwardstep)).

The reattachment length — where the separated shear layer meets the lower wall again — is the canonical validation quantity for this case.
