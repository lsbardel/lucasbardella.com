---
title: Cavity Flow with OpenFOAM
description: A step-by-step walkthrough of the classic lid-driven cavity CFD tutorial using OpenFOAM, foamlib, and Python.
date: 2026 Mar 11
keywords: cfd, openfoam, fluid-dynamics, python, foamlib
---

The [lid-driven cavity](https://www.openfoam.com/documentation/tutorial-guide/2-incompressible-flow/2.1-lid-driven-cavity-flow) is the "Hello, World" of computational fluid dynamics. A square box of fluid, sealed on all sides, with the top lid sliding at constant velocity. No inlets, no outlets — just recirculating flow driven by viscous shear. Despite its simplicity, it exhibits rich physics: a primary vortex that fills most of the cavity, and smaller counter-rotating vortices in the corners.

We solve it with [OpenFOAM](https://openfoam.com) — the open-source CFD toolbox — using [foamlib](https://github.com/gerlero/foamlib) as a Python interface to set up and run the case.

## The Setup

The geometry is a unit square (1 × 1 m). The top wall (the *lid*) moves at **U = (1, 0, 0) m/s**; all other walls are no-slip. The fluid is incompressible and Newtonian, with kinematic viscosity **ν = 0.01 m²/s**, giving a Reynolds number of:

```tex
Re = \frac{U L}{\nu} = \frac{1 \times 1}{0.01} = 100
```

At Re = 100 the flow is laminar and steady. We use the **icoFoam** solver — OpenFOAM's transient incompressible laminar solver.

## The Mesh

The domain is discretised into a structured **20 × 20** grid using `blockMesh`. The thin depth (0.1 m, one cell) with `empty` front/back patches tells OpenFOAM to treat the case as 2-D.

```tsx
import Cavity from "../../components/cfd/cavity.js";
import {schemes} from "../../components/palettes.js";

const cavity = await FileAttachment("../../data/cavity.zip").zip();
const mesh = await cavity.file("mesh.json").json();
const fields = await cavity.file("fields.json").json();
```

<div class="grid grid-cols-2" style="row-gap: 0">

```js
const nParticles = view(Inputs.range([100, 2000], {step: 100, value: 1000, label: "Particles"}));
const particleRadius = view(Inputs.range([1, 6], {step: 0.5, value: 2.5, label: "Particle radius"}));
```
```js
const time = view(Inputs.range(
  [fields.times[0].time, fields.times.at(-1).time],
  {step: 0.1, value: 0.5, label: "Time (s)"}
));
const palette = view(Inputs.select(Object.keys(schemes), {value: "Plasma", label: "Palette"}));
```
</div>

```tsx
display(<Cavity mesh={mesh} fields={fields} time={time} nParticles={nParticles} particleRadius={particleRadius} palette={palette} aspectRatio="100%" />);
```

The colour shows velocity magnitude (dark = slow, bright = fast). The **red** edge is the moving lid; **blue** edges are the fixed walls.

## Case Files

All case files are generated programmatically with foamlib — no manual editing of OpenFOAM dictionaries. The key files are:

| File | Purpose |
|------|---------|
| `system/blockMeshDict` | Mesh geometry and patches |
| `system/controlDict` | Solver, time stepping, output frequency |
| `system/fvSchemes` | Numerical discretisation schemes |
| `system/fvSolution` | Linear solvers and PISO settings |
| `constant/transportProperties` | Kinematic viscosity ν |
| `0/U` | Velocity initial & boundary conditions |
| `0/p` | Pressure initial & boundary conditions |

### Numerical Schemes

| Term | Scheme |
|------|--------|
| Time derivative (∂/∂t) | Euler (first-order implicit) |
| Gradient (∇) | Gauss linear |
| Divergence (∇·) | Gauss linearUpwind — bounded, second-order |
| Laplacian (∇²) | Gauss linear corrected |

### Pressure–Velocity Coupling

icoFoam uses the **PISO** (Pressure-Implicit Split-Operator) algorithm. At each time step:

1. Solve the momentum equation for a predicted velocity **U***
2. Solve the pressure equation to enforce continuity (∇·**U** = 0)
3. Correct the velocity field
4. Repeat steps 2–3 for `nCorrectors = 2` passes

## Running the Simulation

The simulation runs inside a Docker container using the `microfluidica/openfoam` image:

```bash
# Generate the case files
uv run --extra cfd python -m cfd.cavity

# Start the container
docker compose up -d

# Generate the mesh
docker compose exec openfoam bash -c 'source /openfoam/bash.rc && blockMesh'

# Run the solver
docker compose exec openfoam bash -c 'source /openfoam/bash.rc && icoFoam'
```
