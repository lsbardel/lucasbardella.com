---
title: Turbulent Backward-Facing Step
description: OpenFOAM simulation of turbulent flow over a backward-facing step — a classic benchmark for separated flow and turbulence modelling.
date: 2026-03-11
keywords: cfd, openfoam, fluid-dynamics, turbulence, k-epsilon, simpleFoam, foamlib
toc: false
---

```tsx
import BackwardStep from "../../components/cfd/backward-step.js";
import {schemes} from "../../components/palettes.js";

const data = await FileAttachment("../../data/backward-step.zip").zip();
const mesh = await data.file("mesh.json").json();
const fields = await data.file("fields.json").json();
```

Flow separates at the step corner and reattaches downstream — the recirculation zone is the defining feature of this benchmark. Colour shows velocity magnitude; particles trace the local flow direction.

<div class="grid grid-cols-2" style="row-gap: 0">

```js
const nParticles = view(Inputs.range([200, 3000], {step: 100, value: 800, label: "Particles"}));
const particleRadius = view(Inputs.range([1, 5], {step: 0.5, value: 2, label: "Particle radius"}));
```
```js
const palette = view(Inputs.select(Object.keys(schemes), {value: "Plasma", label: "Palette"}));
```

</div>

```tsx
display(<BackwardStep mesh={mesh} fields={fields} nParticles={nParticles} particleRadius={particleRadius} palette={palette} />);
```

The flow enters from the left through a narrow channel (height **H = 25.4 mm**), then expands abruptly into a channel twice as tall. At Reynolds number **Re ≈ 25,400** the flow is turbulent, solved here with the **k-ε** model and the steady-state SIMPLEC algorithm ([OpenFOAM v13 tutorial](https://doc.cfd.direct/openfoam/user-guide-v13/backwardstep)).

The reattachment length — where the separated shear layer meets the lower wall again — is the canonical validation quantity for this case.
