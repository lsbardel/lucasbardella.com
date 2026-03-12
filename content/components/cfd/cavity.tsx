import * as d3 from "npm:d3";
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
  time?: number;
  nParticles?: number;
  particleRadius?: number;
  aspectRatio?: string;
  palette?: string;
  field?: "U" | "p";
  showGrid?: boolean;
  showContours?: boolean;
  showStreamlines?: boolean;
}

const PATCH_COLORS: Record<string, string> = {
  movingWall: "#e63946",
  fixedWalls: "#457b9d",
  frontAndBack: "none",
};

const drawCavity = (
  el: HTMLDivElement,
  mesh: MeshData2D,
  times: TimeStep2D[],
  time: number,
  nParticles: number,
  particleRadius: number,
  palette: string,
  field: "U" | "p",
  showGrid: boolean,
  showContours: boolean,
  showStreamlines: boolean
): (() => void) => {
  const step = times.reduce((best, t) =>
    Math.abs(t.time - time) < Math.abs(best.time - time) ? t : best
  );
  const speeds = step.U.map(([ux, uy]) => Math.sqrt(ux * ux + uy * uy));
  const values = field === "p" ? step.p : speeds;
  const colors = paletteColors(palette);

  fieldRaster(el, mesh, values, 0, 1, 0, 1, colors, [], showContours);

  const sx = d3.scaleLinear().domain([0, 1]).range([0, el.offsetWidth]);
  const sy = d3.scaleLinear().domain([0, 1]).range([el.offsetHeight, 0]);
  const grid = buildGridIndex(mesh.centers, 0, 1, 0, 1);
  const inDomain = (x: number, y: number) => x >= 0 && x <= 1 && y >= 0 && y <= 1;

  if (showGrid) drawGrid(el, mesh, sx, sy);
  if (showStreamlines) drawStreamlines(el, mesh, step.U, grid, sx, sy, inDomain);
  drawBoundaryEdges(el, mesh, sx, sy, PATCH_COLORS, 3);

  const maxSpeed = d3.max(speeds) ?? 1;
  return animateParticles(
    el, mesh, step.U, grid, nParticles, particleRadius, colors, maxSpeed, sx, sy,
    () => ({x: Math.random(), y: Math.random()}), inDomain, 0.01
  );
};

const Cavity = ({
  mesh,
  times,
  time = 0.5,
  nParticles = 500,
  particleRadius = 2,
  aspectRatio = "100%",
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
    const step = times.reduce((best, t) =>
      Math.abs(t.time - time) < Math.abs(best.time - time) ? t : best
    );
    const speeds = step.U.map(([ux, uy]) => Math.sqrt(ux * ux + uy * uy));
    const values = field === "p" ? step.p : speeds;
    legendEl.innerHTML = "";
    legendEl.appendChild(colorLegend(values, paletteColors(palette)));
    const cleanup = drawCavity(el, mesh, times, time, nParticles, particleRadius, palette, field, showGrid, showContours, showStreamlines);
    return () => { cleanup(); el.innerHTML = ""; };
  }, [mesh, times, time, nParticles, particleRadius, palette, field, showGrid, showContours, showStreamlines]);

  const style = {width: "100%", position: "relative" as const, paddingTop: aspectRatio};
  const innerStyle = {position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0};

  return (
    <div>
      <div style={style}><div ref={ref} style={innerStyle} /></div>
      <div ref={legendRef} />
    </div>
  );
};

export default Cavity;
