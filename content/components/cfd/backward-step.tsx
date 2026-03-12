import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import * as React from "npm:react";
import {
  type MeshData2D,
  type TimeStep2D,
  buildGridIndex,
  fieldRaster,
  colorLegend,
  drawGrid,
  drawStreamlines,
  drawBoundaryEdges,
  animateParticles,
  paletteColors,
} from "./mesh2d.js";

interface Props {
  mesh: MeshData2D;
  times: TimeStep2D[];
  nParticles?: number;
  particleRadius?: number;
  palette?: string;
  field?: "U" | "p";
  showGrid?: boolean;
  showContours?: boolean;
  showStreamlines?: boolean;
}

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
  if (x < X_STEP && y < Y_STEP) return false;
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
  mesh: MeshData2D,
  times: TimeStep2D[],
  nParticles: number,
  particleRadius: number,
  palette: string,
  field: "U" | "p",
  showGrid: boolean,
  showContours: boolean,
  showStreamlines: boolean
): (() => void) => {
  const xs = mesh.points.map(p => p[0]);
  const ys = mesh.points.map(p => p[1]);
  const xMin = d3.min(xs)!;
  const xMax = d3.max(xs)!;
  const yMin = d3.min(ys)!;
  const yMax = d3.max(ys)!;

  const step = times.at(-1)!;
  const speeds = step.U.map(([ux, uy]) => Math.sqrt(ux * ux + uy * uy));
  const maxSpeed = d3.max(speeds) ?? 1;
  const values = field === "p" ? step.p : speeds;
  const colors = paletteColors(palette);

  const stepMask = Plot.rect(
    [{x1: xMin, x2: X_STEP, y1: yMin, y2: Y_STEP}],
    {x1: "x1", x2: "x2", y1: "y1", y2: "y2", fill: "var(--theme-background, #fff)"}
  );

  fieldRaster(el, mesh, values, xMin, xMax, yMin, yMax, colors, [stepMask], showContours);

  const sx = d3.scaleLinear().domain([xMin, xMax]).range([0, el.offsetWidth]);
  const sy = d3.scaleLinear().domain([yMin, yMax]).range([el.offsetHeight, 0]);
  const grid = buildGridIndex(mesh.centers, xMin, xMax, yMin, yMax);
  const domainCheck = (x: number, y: number) => inDomain(x, y, xMin, xMax, yMin, yMax);

  if (showGrid) drawGrid(el, mesh, sx, sy);
  if (showStreamlines) drawStreamlines(el, mesh, step.U, grid, sx, sy, domainCheck);
  drawBoundaryEdges(el, mesh, sx, sy, PATCH_COLORS, 2);

  return animateParticles(
    el, mesh, step.U, grid, nParticles, particleRadius, colors, maxSpeed, sx, sy,
    () => spawnInDomain(xMin, xMax, yMin, yMax),
    domainCheck,
    0.0002
  );
};

const BackwardStep = ({
  mesh,
  times,
  nParticles = 800,
  particleRadius = 2,
  palette = "Plasma",
  field = "U",
  showGrid = false,
  showContours = false,
  showStreamlines = false,
}: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const legendRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    const legendEl = legendRef.current;
    if (!el || !legendEl) return;
    const step = times.at(-1)!;
    const speeds = step.U.map(([ux, uy]) => Math.sqrt(ux * ux + uy * uy));
    const values = field === "p" ? step.p : speeds;
    legendEl.innerHTML = "";
    legendEl.appendChild(colorLegend(values, paletteColors(palette)));
    const cleanup = drawBackwardStep(el, mesh, times, nParticles, particleRadius, palette, field, showGrid, showContours, showStreamlines);
    return () => { cleanup(); el.innerHTML = ""; };
  }, [mesh, times, nParticles, particleRadius, palette, field, showGrid, showContours, showStreamlines]);

  const style = {width: "100%", position: "relative" as const, paddingTop: "16.4%"};
  const innerStyle = {position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0};

  return (
    <div>
      <div style={style}><div ref={ref} style={innerStyle} /></div>
      <div ref={legendRef} />
    </div>
  );
};

export default BackwardStep;
