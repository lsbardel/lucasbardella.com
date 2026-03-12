---
title: Interactive CFD
description: How to set up, run, and visualize a lid-driven cavity CFD simulation with OpenFOAM, foamlib, and Observable Plot — including mesh grid, velocity field, contours, and streamlines.
date: 2026 Mar 12

keywords: cfd, openfoam, fluid-dynamics, python, foamlib, observable-plot, visualization, mesh, streamlines
heroImage: vortex
heroOpacity: "0.2"
---

The [lid-driven cavity](https://www.openfoam.com/documentation/tutorial-guide/2-incompressible-flow/2.1-lid-driven-cavity-flow) is the "Hello, World" of computational fluid dynamics. A square box of fluid, sealed on all sides, with the top lid sliding at constant velocity. No inlets, no outlets, just recirculating flow driven by viscous shear. Despite its simplicity, it exhibits rich physics: a primary vortex that fills most of the cavity.

We solve it with [OpenFOAM](https://openfoam.com), the open-source CFD toolbox, using [foamlib](https://github.com/gerlero/foamlib) as a Python interface to set up and run the case.

The [cfd](https://github.com/lsbardel/lucasbardella.com/tree/main/cfd) module contains utilities to read OpenFOAM meshes and fields, generate case files programmatically, and visualise results with [Observable Plot](https://observablehq.com/plot).

## The Setup

The geometry is a unit square (1 × 1 m). The top wall (the *lid*) moves at **U = (1, 0, 0) m/s**; all other walls are no-slip. The fluid is incompressible and Newtonian, with kinematic viscosity **ν = 0.01 m²/s**, giving a Reynolds number of:

```tex
Re = \frac{U L}{\nu} = \frac{1 \times 1}{0.01} = 100
```

We run two cases: **Re = 100** (ν = 0.01 m²/s) and **Re = 1000** (ν = 0.001 m²/s), both laminar and steady. We use the **icoFoam** solver, OpenFOAM's transient incompressible laminar solver.

## The Simulation

The domain is discretised into a structured **50 × 50** grid using `blockMesh`. The thin depth (0.1 m, one cell) with `empty` front/back patches tells OpenFOAM to treat the case as 2-D.

We show the simulation results for the two cases in the interactive plot below. Use the controls to switch between Re = 100 and Re = 1000 and toggle visualization options.

```tsx
import Cavity from "../../components/cfd/cavity.js";
import {meshFields2d} from "../../components/cfd/mesh2d.js";
import {schemes} from "../../components/palettes.js";

const cavity_100 = await FileAttachment("../../data/cfd/cavity_100.zip").zip();
const solution_100 = meshFields2d(
  await cavity_100.file("mesh.json").json(),
  await cavity_100.file("fields.json").json()
);
const cavity_1000 = await FileAttachment("../../data/cfd/cavity_1000.zip").zip();
const solution_1000 = meshFields2d(
  await cavity_1000.file("mesh.json").json(),
  await cavity_1000.file("fields.json").json()
);
```

<div class="grid grid-cols-2" style="row-gap: 0">
<div>

```js
const re = view(Inputs.radio([100, 1000], {value: 1000, label: "Re"}));
const nParticles = view(Inputs.range([100, 2000], {step: 100, value: 1000, label: "Particles"}));
const particleRadius = view(Inputs.range([1, 6], {step: 0.5, value: 2.5, label: "Particle radius"}));
```
```js
const solution = re === 1000 ? solution_1000 : solution_100;
const activeTimes = solution.times;
const activeMesh = solution.mesh;
const time = view(Inputs.range(
  [activeTimes[0].time, activeTimes.at(-1).time],
  {step: 0.1, value: activeTimes.at(-1).time, label: "Time (s)"}
));
```
</div>

```js
const defaultPalette = new URLSearchParams(location.search).get("palette") ?? "Inferno";
const palette = view(Inputs.select(Object.keys(schemes), {value: defaultPalette, label: "Palette"}));
const field = view(Inputs.radio(["U", "p"], {value: "U", label: "Field"}));
const showGrid = view(Inputs.toggle({label: "Show grid", value: false}));
const showContours = view(Inputs.toggle({label: "Show contours", value: false}));
const showStreamlines = view(Inputs.toggle({label: "Show streamlines", value: false}));
```
</div>

```tsx
display(<Cavity mesh={activeMesh} times={activeTimes} time={time} nParticles={nParticles} particleRadius={particleRadius} palette={palette} field={field} showGrid={showGrid} showContours={showContours} showStreamlines={showStreamlines} aspectRatio="100%" />);
```

## Visualization

The colour shows velocity (U) or pressure (p) magnitude (see legend). The **red** edge is the moving lid; **blue** edges are the fixed walls.

The visualisation is built with [Observable Plot](https://observablehq.com/plot) for the field raster and iso-contours, similar to the [Mandelbrot Set in labs](/lab/2023/mandelbrot-set).

[D3](https://d3js.org) is used for the SVG boundary outlines and streamlines, and a Canvas 2D API for the animated particles. The velocity field is interpolated at arbitrary positions using inverse-distance weighting from the OpenFOAM cell centres, and streamlines are integrated with a 4th-order Runge-Kutta scheme.

Use the **Time** slider to go through the simulation from the initial state to steady state. At Re = 100 the vortex snaps into place almost immediately, a quiet orderly swirl that barely changes after the first second.

At Re = 1000 the story is richer: drag the slider slowly and watch the primary vortex gradually migrate from the upper-right corner toward the geometric centre of the cavity, while the two bottom corner eddies quietly grow into existence. There is something almost meditative about it, the fluid finding its equilibrium, all encoded in a palette of shifting colour.

And, by the way, choose the **palette** that makes you happiest. I have a soft spot for `Inferno` myself, but the `Viridis` and `Magma` schemes are also excellent choices for perceptual uniformity and colourblind-friendliness.

## Analysis

At **Re = 100** viscosity dominates: the primary vortex centre sits at approximately **(0.617, 0.738)**, compressed into the upper portion of the cavity, and the two bottom corner vortices are barely visible.

At **Re = 1,000** inertia becomes significant: the primary vortex migrates toward the geometric centre (~0.531, ~0.565), grows more circular, and the corner vortices become clearly visible. Both cases can be validated against [Ghia, Ghia & Shin (1982)](https://doi.org/10.1016/0021-9991(82)90058-4), the canonical benchmark for lid-driven cavity flow.

| Feature | Re = 100 | Re = 1,000 |
|---------|----------|-----------|
| Primary vortex centre | (0.617, 0.738) | (~0.531, ~0.565) |
| Corner vortices | Tiny | Clearly visible |
| Primary vortex shape | Elongated, upper-right | Circular, centred |
| End time to steady state | ~2 s | ~20 s |

### Time Step and Courant Number

The time step Δt must satisfy the Courant stability criterion:

```tex
Co = \frac{U \, \Delta t}{\Delta x} < 1
```

With lid velocity U = 1 m/s, cell size Δx = 1/50 = 0.02 m, and Δt = 0.005 s, the Courant number is Co = 0.25, well within the stability limit. For Re = 1000 the same Δt applies since the mesh and lid velocity are unchanged.

Convergence is checked by monitoring the residuals of U and p. The solution is considered converged when the transient dies out and the field no longer changes between time steps. At Re = 100 this typically occurs within the first few seconds of simulated time; at Re = 1000 a longer run is needed as the flow takes more time to reach steady state.


## Running the Simulation

The simulation runs inside a Docker container included in the [repository](https://github.com/lsbardel/lucasbardella.com).
The `Makefile` provides convenient targets to generate case files, start the container, and run the solver:

```bash
make cfd-build  # Build the CFD Docker image
make cfd-cases  # Generate case files for Re = 100 and Re = 1000
```

The `cfd-build` target assembles a Docker image from `cfd/dev/cfd.dockerfile`, layering the OpenFOAM installation with a Python virtual environment managed by [uv](https://github.com/astral-sh/uv). The `cfd-cases` target then runs the solver inside the container, mounting the local `cfd/` directory so that the generated mesh and field data are written back to the host and picked up by Observable Framework at build time. No local OpenFOAM installation is required.

## What's Next

The lid-driven cavity is a clean benchmark but an artificial one, there are no real engineering systems that look like it. The next step is something more physically meaningful: the **backward-facing step**.

In that case, flow enters a channel and suddenly encounters a downward step in the floor. The abrupt expansion causes the flow to separate and form a recirculation zone just downstream of the step, a phenomenon that appears everywhere from combustion chambers to aircraft aerodynamics. Unlike the cavity, the reattachment length (how far downstream the flow reattaches to the lower wall) is a measurable quantity with well-established experimental data, making it an excellent validation case.

Further down the line, I'll explore transonic/supersonic flow, something I'm much more familiar with from my PhD work.
