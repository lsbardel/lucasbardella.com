import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import * as React from "npm:react";
import {
  type MeshData,
  type FieldsData,
  buildGridIndex,
  velocityRaster,
  drawBoundaryEdges,
  animateParticles,
  paletteColors,
} from "./mesh.js";

interface Props {
  mesh: MeshData;
  fields: FieldsData;
  nParticles?: number;
  particleRadius?: number;
  palette?: string;
}

// Step geometry (metres) — matches backward_step.py
const X_STEP = 0;
const Y_STEP = 0;

const PATCH_COLORS: Record<string, string> = {
  inlet: "#e63946",
  outlet: "#2a9d8f",
  upperWall: "#457b9d",
  lowerWall: "#457b9d",
  frontAndBack: "none",
};

const inDomain = (
  x: number, y: number,
  xMin: number, xMax: number, yMin: number, yMax: number
): boolean => {
  if (x < xMin || x > xMax || y < yMin || y > yMax) return false;
  if (x < X_STEP && y < Y_STEP) return false; // solid step region
  return true;
};

const spawnInDomain = (
  xMin: number, xMax: number, yMin: number, yMax: number
): {x: number; y: number} => {
  for (;;) {
    const x = xMin + Math.random() * (xMax - xMin);
    const y = yMin + Math.random() * (yMax - yMin);
    if (inDomain(x, y, xMin, xMax, yMin, yMax)) return {x, y};
  }
};

const drawBackwardStep = (
  el: HTMLDivElement,
  mesh: MeshData,
  fields: FieldsData,
  nParticles: number,
  particleRadius: number,
  palette: string
): (() => void) => {
  const xs = mesh.points.map(p => p[0]);
  const ys = mesh.points.map(p => p[1]);
  const xMin = d3.min(xs)!;
  const xMax = d3.max(xs)!;
  const yMin = d3.min(ys)!;
  const yMax = d3.max(ys)!;

  const step = fields.times.at(-1)!;
  const U = step.U as [number, number][];
  const speeds = U.map(([ux, uy]) => Math.sqrt(ux * ux + uy * uy));
  const maxSpeed = d3.max(speeds) ?? 1;
  const colors = paletteColors(palette);

  // Solid step mask overlaid on the raster
  const stepMask = Plot.rect(
    [{x1: xMin, x2: X_STEP, y1: yMin, y2: Y_STEP}],
    {x1: "x1", x2: "x2", y1: "y1", y2: "y2", fill: "var(--theme-background, #fff)"}
  );

  velocityRaster(
    el, mesh.centres as [number, number][], speeds, maxSpeed,
    xMin, xMax, yMin, yMax, colors, [stepMask]
  );

  const sx = d3.scaleLinear().domain([xMin, xMax]).range([0, el.offsetWidth]);
  const sy = d3.scaleLinear().domain([yMin, yMax]).range([el.offsetHeight, 0]);
  drawBoundaryEdges(el, mesh, sx, sy, PATCH_COLORS, 2);

  const grid = buildGridIndex(mesh.centres as [number, number][], xMin, xMax, yMin, yMax);

  return animateParticles(
    el, mesh, U, grid, nParticles, particleRadius, colors, maxSpeed, sx, sy,
    () => spawnInDomain(xMin, xMax, yMin, yMax),
    (x, y) => inDomain(x, y, xMin, xMax, yMin, yMax),
    0.0002
  );
};

const BackwardStep = ({
  mesh,
  fields,
  nParticles = 800,
  particleRadius = 2,
  palette = "Plasma",
}: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanup = drawBackwardStep(el, mesh, fields, nParticles, particleRadius, palette);
    return () => { cleanup(); el.innerHTML = ""; };
  }, [mesh, fields, nParticles, particleRadius, palette]);

  // Domain aspect: x [-20.6, 290] mm, y [-25.4, 25.4] mm → height/width ≈ 16.4%
  const style = {width: "100%", position: "relative" as const, paddingTop: "16.4%"};
  const innerStyle = {position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0};

  return <div style={style}><div ref={ref} style={innerStyle} /></div>;
};

export default BackwardStep;
