import * as d3 from "npm:d3";
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
  time?: number;
  nParticles?: number;
  particleRadius?: number;
  aspectRatio?: string;
  palette?: string;
}

const PATCH_COLORS: Record<string, string> = {
  movingWall: "#e63946",
  fixedWalls: "#457b9d",
  frontAndBack: "none",
};

const drawCavity = (
  el: HTMLDivElement,
  mesh: MeshData,
  fields: FieldsData,
  time: number,
  nParticles: number,
  particleRadius: number,
  palette: string
): (() => void) => {
  const step = fields.times.reduce((best, t) =>
    Math.abs(t.time - time) < Math.abs(best.time - time) ? t : best
  );
  const U = step.U as [number, number][];
  const speeds = U.map(([ux, uy]) => Math.sqrt(ux * ux + uy * uy));
  const maxSpeed = d3.max(speeds) ?? 1;
  const colors = paletteColors(palette);

  velocityRaster(el, mesh.centres as [number, number][], speeds, maxSpeed, 0, 1, 0, 1, colors);

  const sx = d3.scaleLinear().domain([0, 1]).range([0, el.offsetWidth]);
  const sy = d3.scaleLinear().domain([0, 1]).range([el.offsetHeight, 0]);
  drawBoundaryEdges(el, mesh, sx, sy, PATCH_COLORS, 3);

  const grid = buildGridIndex(mesh.centres as [number, number][], 0, 1, 0, 1);
  const inDomain = (x: number, y: number) => x >= 0 && x <= 1 && y >= 0 && y <= 1;
  const spawnParticle = () => ({x: Math.random(), y: Math.random()});

  return animateParticles(
    el, mesh, U, grid, nParticles, particleRadius, colors, maxSpeed, sx, sy,
    spawnParticle, inDomain, 0.01
  );
};

const Cavity = ({
  mesh,
  fields,
  time = 0.5,
  nParticles = 500,
  particleRadius = 2,
  aspectRatio = "100%",
  palette = "Plasma",
}: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanup = drawCavity(el, mesh, fields, time, nParticles, particleRadius, palette);
    return () => { cleanup(); el.innerHTML = ""; };
  }, [mesh, fields, time, nParticles, particleRadius, palette]);

  const style = {width: "100%", position: "relative" as const, paddingTop: aspectRatio};
  const innerStyle = {position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0};

  return <div style={style}><div ref={ref} style={innerStyle} /></div>;
};

export default Cavity;
