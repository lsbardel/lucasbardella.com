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
import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import {schemes} from "../palettes.js";

// ---------------------------------------------------------------------------
// Shared data interfaces
// ---------------------------------------------------------------------------

export interface BoundaryPatch {
  type: string;
  startFace: number;
  nFaces: number;
}

export interface MeshData {
  points: [number, number][];
  faces: number[][];
  centres: [number, number][];
  boundary: Record<string, BoundaryPatch>;
}

export interface TimeStep {
  time: number;
  U: [number, number][];
  p: number[];
}

export interface FieldsData {
  times: TimeStep[];
}

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
  centres: [number, number][],
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  nx = 60, ny = 20
): GridIndex => {
  const bins: number[][] = Array.from({length: nx * ny}, () => []);
  const dx = (xMax - xMin) / nx;
  const dy = (yMax - yMin) / ny;
  for (let i = 0; i < centres.length; i++) {
    const ci = Math.min(nx - 1, Math.max(0, Math.floor((centres[i][0] - xMin) / dx)));
    const cj = Math.min(ny - 1, Math.max(0, Math.floor((centres[i][1] - yMin) / dy)));
    bins[cj * nx + ci].push(i);
  }
  return {nx, ny, xMin, xMax, yMin, yMax, bins};
};

export const nearestCell = (
  x: number,
  y: number,
  centres: [number, number][],
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
        const ex = centres[idx][0] - x;
        const ey = centres[idx][1] - y;
        const d2 = ex * ex + ey * ey;
        if (d2 < bestDist) {bestDist = d2; bestIdx = idx;}
      }
    }
  }
  return bestIdx;
};

// ---------------------------------------------------------------------------
// Velocity magnitude raster
// ---------------------------------------------------------------------------

/**
 * Append a Plot.raster of velocity magnitude to `el`.
 *
 * @param extraMarks  Optional additional Plot marks (e.g. a mask rect for solid regions).
 */
export const velocityRaster = (
  el: HTMLDivElement,
  centres: [number, number][],
  speeds: number[],
  maxSpeed: number,
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  paletteColors: readonly string[],
  extraMarks: Plot.Markish[] = []
): void => {
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const rasterData = centres.map(([cx, cy], i) => ({x: cx, y: cy, speed: speeds[i]}));
  const plot = Plot.plot({
    width,
    height,
    margin: 0,
    x: {domain: [xMin, xMax], axis: null},
    y: {domain: [yMin, yMax], axis: null},
    color: {range: [...paletteColors], domain: [0, maxSpeed], legend: false},
    marks: [
      Plot.raster(rasterData, {
        x: "x", y: "y", fill: "speed",
        interpolate: "barycentric",
        x1: xMin, x2: xMax, y1: yMin, y2: yMax,
      }),
      ...extraMarks,
    ],
  });
  el.appendChild(plot);
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
  mesh: MeshData,
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
  mesh: MeshData,
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
      const idx = nearestCell(p.x, p.y, mesh.centres as [number, number][], grid);
      const [vx, vy] = U[idx];
      p.x += vx * dt;
      p.y += vy * dt;
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
