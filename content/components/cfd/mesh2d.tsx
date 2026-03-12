/**
 * Shared mesh plotting utilities for CFD visualisations.
 *
 * Exports:
 *  - Shared data interfaces (MeshData, FieldsData, …)
 *  - buildGridIndex / nearestCell — fast nearest-cell velocity lookup
 *  - velocityRaster — Plot.raster layer for velocity magnitude
 *  - drawBoundaryEdges — data-driven SVG boundary outlines
 *  - animateParticles — canvas particle tracer, returns cancelAnimationFrame
 */
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import { schemes } from "../palettes.js";

// ---------------------------------------------------------------------------
// Shared data interfaces
// ---------------------------------------------------------------------------

export interface BoundaryPatch {
  type: string;
  startFace: number;
  nFaces: number;
}

interface MeshData3D {
  points: [number, number, number][];
  faces: number[][];
  centers: [number, number, number][];
  boundary: Record<string, BoundaryPatch>;
}

interface TimeStep3D {
  time: number;
  U: [number, number, number][];
  p: number[];
}

export interface MeshData2D {
  points: [number, number][];
  faces: number[][];
  centers: [number, number][];
  boundary: Record<string, BoundaryPatch>;
}

export interface TimeStep2D {
  time: number;
  U: [number, number][];
  p: number[];
}

// ---------------------------------------------------------------------------
// 3D → 2D preprocessing
// ---------------------------------------------------------------------------

/**
 * Convert raw 3D mesh+fields data (as loaded from a zip) into 2D by dropping
 * the z component from points, centers, and U vectors.
 */
export const meshFields2d = (
  mesh: MeshData3D,
  times: TimeStep3D[]
): {mesh: MeshData2D; times: TimeStep2D[]} => ({
  mesh: {
    points: mesh.points.map(([x, y, _z]) => [x, y]),
    faces: mesh.faces,
    centers: mesh.centers.map(([x, y, _z]) => [x, y]),
    boundary: mesh.boundary,
  },
  times: times.map(t => ({
      time: t.time,
      U: t.U.map(([x, y, _z]) => [x, y]),
      p: t.p,
    })),
});

// ---------------------------------------------------------------------------
// Grid index — fast O(1) nearest-cell lookup
// ---------------------------------------------------------------------------

export interface GridIndex {
  nx: number;
  ny: number;
  xMin: number; xMax: number;
  yMin: number; yMax: number;
  bins: number[][];
}

export const buildGridIndex = (
  centers: [number, number][],
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  nx = 60, ny = 20
): GridIndex => {
  const bins: number[][] = Array.from({length: nx * ny}, () => []);
  const dx = (xMax - xMin) / nx;
  const dy = (yMax - yMin) / ny;
  for (let i = 0; i < centers.length; i++) {
    const ci = Math.min(nx - 1, Math.max(0, Math.floor((centers[i][0] - xMin) / dx)));
    const cj = Math.min(ny - 1, Math.max(0, Math.floor((centers[i][1] - yMin) / dy)));
    bins[cj * nx + ci].push(i);
  }
  return {nx, ny, xMin, xMax, yMin, yMax, bins};
};

export const nearestCell = (
  x: number,
  y: number,
  centers: [number, number][],
  grid: GridIndex
): number => {
  const {nx, ny, xMin, xMax, yMin, yMax, bins} = grid;
  const dx = (xMax - xMin) / nx;
  const dy = (yMax - yMin) / ny;
  const ci = Math.min(nx - 1, Math.max(0, Math.floor((x - xMin) / dx)));
  const cj = Math.min(ny - 1, Math.max(0, Math.floor((y - yMin) / dy)));
  let bestDist = Infinity;
  let bestIdx = 0;
  for (let dj = -1; dj <= 1; dj++) {
    for (let di = -1; di <= 1; di++) {
      const ii = ci + di, jj = cj + dj;
      if (ii < 0 || ii >= nx || jj < 0 || jj >= ny) continue;
      for (const idx of bins[jj * nx + ii]) {
        const ex = centers[idx][0] - x;
        const ey = centers[idx][1] - y;
        const d2 = ex * ex + ey * ey;
        if (d2 < bestDist) {bestDist = d2; bestIdx = idx;}
      }
    }
  }
  return bestIdx;
};

// ---------------------------------------------------------------------------
// Field magnitude raster
// ---------------------------------------------------------------------------

/**
 * Append a Plot.raster of a field (e.g., velocity magnitude or pressure) to `el`.
 *
 * @param extraMarks  Optional additional Plot marks (e.g. a mask rect for solid regions).
 */
export const fieldRaster = (
  el: HTMLDivElement,
  mesh: MeshData2D,
  values: number[],
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  paletteColors: readonly string[],
  extraMarks: Plot.Markish[] = [],
  showContours = false
): void => {
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const vMin = d3.min(values)!;
  const vMax = d3.max(values)!;
  const {centers, points, faces, boundary} = mesh;

  // Build a grid index for nearest-cell lookup at boundary face centers
  const grid = buildGridIndex(centers, xMin, xMax, yMin, yMax);

  // Start with cell centre data points
  const rasterData: {x: number; y: number; value: number}[] =
    centers.map(([cx, cy], i) => ({x: cx, y: cy, value: values[i]}));

  // Add a ghost point at each boundary face centre (excluding frontAndBack)
  for (const [name, patch] of Object.entries(boundary)) {
    if (patch.type === "empty") continue;
    const end = patch.startFace + patch.nFaces;
    for (let fi = patch.startFace; fi < end; fi++) {
      // face centre = mean of unique 2D vertex positions
      const seen: [number, number][] = [];
      for (const vi of faces[fi]) {
        const [px, py] = points[vi];
        if (!seen.some(([ex, ey]) => Math.abs(ex - px) < 1e-10 && Math.abs(ey - py) < 1e-10)) {
          seen.push([px, py]);
        }
      }
      if (seen.length < 2) continue;
      const fx = (seen[0][0] + seen[1][0]) / 2;
      const fy = (seen[0][1] + seen[1][1]) / 2;
      const idx = nearestCell(fx, fy, centers, grid);
      rasterData.push({x: fx, y: fy, value: values[idx]});
    }
  }
  const plot = Plot.plot({
    width,
    height,
    margin: 0,
    x: {domain: [xMin, xMax], axis: null},
    y: {domain: [yMin, yMax], axis: null},
    color: {range: [...paletteColors], domain: [vMin, vMax], legend: false},
    marks: [
      Plot.raster(rasterData, {
        x: "x", y: "y", fill: "value",
        interpolate: "barycentric",
        x1: xMin, x2: xMax, y1: yMin, y2: yMax,
      }),
      ...(showContours ? [Plot.contour(rasterData, {
        x: "x", y: "y", value: "value",
        interpolate: "barycentric",
        x1: xMin, x2: xMax, y1: yMin, y2: yMax,
        stroke: "white", strokeOpacity: 0.5, strokeWidth: 0.75, fill: "none",
      })] : []),
      ...extraMarks,
    ],
  });
  el.appendChild(plot);
};

export const colorLegend = (
  values: number[],
  paletteColors: readonly string[]
): HTMLElement =>
  Plot.legend({
    color: {type: "linear", range: [...paletteColors], domain: [d3.min(values)!, d3.max(values)!]},
  });

// ---------------------------------------------------------------------------
// Grid drawing
// ---------------------------------------------------------------------------

/**
 * Draw all internal cell faces as a thin SVG grid overlay.
 * Skips the frontAndBack (empty) patch faces.
 */
export const drawGrid = (
  el: HTMLDivElement,
  mesh: MeshData2D,
  sx: d3.ScaleLinear<number, number>,
  sy: d3.ScaleLinear<number, number>,
  color = "rgba(255,255,255,0.5)",
  strokeWidth = 0.5
): void => {
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  // Determine which faces belong to non-empty boundary patches
  const boundaryFaceSet = new Set<number>();
  for (const patch of Object.values(mesh.boundary)) {
    const end = patch.startFace + patch.nFaces;
    for (let fi = patch.startFace; fi < end; fi++) boundaryFaceSet.add(fi);
  }
  const svg = d3.select(el).append("svg")
    .attr("width", width).attr("height", height)
    .style("position", "absolute").style("top", "0").style("left", "0");
  for (let fi = 0; fi < mesh.faces.length; fi++) {
    if (boundaryFaceSet.has(fi)) continue;
    const seen: [number, number][] = [];
    for (const vi of mesh.faces[fi]) {
      const [px, py] = mesh.points[vi];
      if (!seen.some(([ex, ey]) => Math.abs(ex - px) < 1e-10 && Math.abs(ey - py) < 1e-10))
        seen.push([px, py]);
    }
    if (seen.length < 2) continue;
    svg.append("line")
      .attr("x1", sx(seen[0][0])).attr("y1", sy(seen[0][1]))
      .attr("x2", sx(seen[1][0])).attr("y2", sy(seen[1][1]))
      .attr("stroke", color).attr("stroke-width", strokeWidth);
  }
};

// ---------------------------------------------------------------------------
// Boundary edge drawing
// ---------------------------------------------------------------------------

/**
 * Append an SVG overlay to `el` with boundary patch edges coloured by `patchColors`.
 * Patches absent from `patchColors` (or mapped to "none") are skipped.
 *
 * Each boundary face is a quad in 3D; after projecting to 2D we get two unique
 * (x, y) points — the edge is drawn between them.
 */
export const drawBoundaryEdges = (
  el: HTMLDivElement,
  mesh: MeshData2D,
  sx: d3.ScaleLinear<number, number>,
  sy: d3.ScaleLinear<number, number>,
  patchColors: Record<string, string>,
  strokeWidth = 2
): void => {
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const svg = d3
    .select(el)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("position", "absolute")
    .style("top", "0")
    .style("left", "0");

  for (const [name, patch] of Object.entries(mesh.boundary)) {
    const color = patchColors[name];
    if (!color || color === "none") continue;
    const end = patch.startFace + patch.nFaces;
    for (let fi = patch.startFace; fi < end; fi++) {
      // Collect unique (x,y) positions from this face's vertices
      const seen: [number, number][] = [];
      for (const vi of mesh.faces[fi]) {
        const [px, py] = mesh.points[vi];
        if (!seen.some(([ex, ey]) => Math.abs(ex - px) < 1e-10 && Math.abs(ey - py) < 1e-10)) {
          seen.push([px, py]);
        }
      }
      if (seen.length < 2) continue;
      svg.append("line")
        .attr("x1", sx(seen[0][0])).attr("y1", sy(seen[0][1]))
        .attr("x2", sx(seen[1][0])).attr("y2", sy(seen[1][1]))
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth);
    }
  }
};

// ---------------------------------------------------------------------------
// Streamlines
// ---------------------------------------------------------------------------

/**
 * Draw deterministic streamlines by integrating the velocity field with RK4.
 * Seeds are distributed on a regular grid across the domain.
 */
export const drawStreamlines = (
  el: HTMLDivElement,
  mesh: MeshData2D,
  U: [number, number][],
  grid: GridIndex,
  sx: d3.ScaleLinear<number, number>,
  sy: d3.ScaleLinear<number, number>,
  inDomain: (x: number, y: number) => boolean,
  nSeeds = 20,
  dt = 0.002,
  maxSteps = 2000,
  color = "rgba(255,255,255,0.6)",
  strokeWidth = 1
): void => {
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const svg = d3.select(el).append("svg")
    .attr("width", width).attr("height", height)
    .style("position", "absolute").style("top", "0").style("left", "0");

  const xMin = grid.xMin, xMax = grid.xMax, yMin = grid.yMin, yMax = grid.yMax;

  // IDW velocity interpolation from 3×3 neighbourhood of grid bins
  const vel = (x: number, y: number): [number, number] => {
    const {nx, ny, xMin, xMax, yMin, yMax, bins} = grid;
    const dx = (xMax - xMin) / nx;
    const dy = (yMax - yMin) / ny;
    const ci = Math.min(nx - 1, Math.max(0, Math.floor((x - xMin) / dx)));
    const cj = Math.min(ny - 1, Math.max(0, Math.floor((y - yMin) / dy)));
    let wx = 0, wy = 0, wsum = 0;
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        const ii = ci + di, jj = cj + dj;
        if (ii < 0 || ii >= nx || jj < 0 || jj >= ny) continue;
        for (const idx of bins[jj * nx + ii]) {
          const ex = mesh.centers[idx][0] - x;
          const ey = mesh.centers[idx][1] - y;
          const d2 = ex * ex + ey * ey;
          const w = d2 < 1e-20 ? 1e20 : 1 / d2;
          wx += w * U[idx][0];
          wy += w * U[idx][1];
          wsum += w;
        }
      }
    }
    return wsum > 0 ? [wx / wsum, wy / wsum] : [0, 0];
  };

  // RK4 step
  const rk4 = (x: number, y: number): [number, number] => {
    const [k1x, k1y] = vel(x, y);
    const [k2x, k2y] = vel(x + 0.5 * dt * k1x, y + 0.5 * dt * k1y);
    const [k3x, k3y] = vel(x + 0.5 * dt * k2x, y + 0.5 * dt * k2y);
    const [k4x, k4y] = vel(x + dt * k3x, y + dt * k3y);
    return [
      x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x),
      y + (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y),
    ];
  };

  // Regular seed grid
  for (let i = 0; i < nSeeds; i++) {
    for (let j = 0; j < nSeeds; j++) {
      const x0 = xMin + (i + 0.5) * (xMax - xMin) / nSeeds;
      const y0 = yMin + (j + 0.5) * (yMax - yMin) / nSeeds;
      if (!inDomain(x0, y0)) continue;

      const pts: [number, number][] = [[x0, y0]];
      let x = x0, y = y0;
      for (let s = 0; s < maxSteps; s++) {
        const [nx, ny] = rk4(x, y);
        if (!inDomain(nx, ny)) break;
        pts.push([nx, ny]);
        x = nx; y = ny;
      }

      if (pts.length < 2) continue;
      svg.append("path")
        .attr("d", d3.line<[number, number]>(p => sx(p[0]), p => sy(p[1]))(pts)!)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", 0.7);
    }
  }
};

// ---------------------------------------------------------------------------
// Particle animation
// ---------------------------------------------------------------------------

export interface Particle {
  x: number;
  y: number;
}

/**
 * Start an animated particle tracer on a canvas appended to `el`.
 *
 * @param spawnParticle  Returns a new random particle inside the domain.
 * @param inDomain       Returns true if (x, y) is inside the fluid domain.
 * @param dt             Advection time step [s].
 * @returns              Cleanup function (cancels the animation frame).
 */
export const animateParticles = (
  el: HTMLDivElement,
  mesh: MeshData2D,
  U: [number, number][],
  grid: GridIndex,
  nParticles: number,
  particleRadius: number,
  paletteColors: readonly string[],
  maxSpeed: number,
  sx: d3.ScaleLinear<number, number>,
  sy: d3.ScaleLinear<number, number>,
  spawnParticle: () => Particle,
  inDomain: (x: number, y: number) => boolean,
  dt: number
): (() => void) => {
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.cssText = `width:${width}px;height:${height}px;position:absolute;top:0;left:0;pointer-events:none`;
  el.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const speedColor = d3
    .scaleQuantize<string>()
    .domain([0, maxSpeed])
    .range([...paletteColors].reverse());

  const particles: Particle[] = Array.from({length: nParticles}, spawnParticle);
  let rafId: number;

  const tick = () => {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      const idx = nearestCell(p.x, p.y, mesh.centers as [number, number][], grid);
      const [vx, vy] = U[idx];
      const noise = maxSpeed * 0.05;
      p.x += vx * dt + (Math.random() - 0.5) * noise * dt;
      p.y += vy * dt + (Math.random() - 0.5) * noise * dt;
      if (!inDomain(p.x, p.y)) Object.assign(p, spawnParticle());
      const speed = Math.sqrt(vx * vx + vy * vy);
      ctx.beginPath();
      ctx.arc(sx(p.x), sy(p.y), particleRadius, 0, 2 * Math.PI);
      ctx.fillStyle = speedColor(speed);
      ctx.fill();
    }
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
};

// ---------------------------------------------------------------------------
// Convenience: resolve palette colours
// ---------------------------------------------------------------------------

export const paletteColors = (name: string): readonly string[] =>
  schemes[name] ?? schemes["Plasma"];
