import * as React from "npm:react";
import * as d3 from "npm:d3";
import { type BaseLogoProps, LogoWrapper } from "./base.js";
import { schemes } from "../palettes.js";

type Pattern = "phyllotaxis" | "random" | "ring" | "grid";

export interface VoronoiLogoProps extends BaseLogoProps {
  seeds?: number;
  pattern?: Pattern;
  showVoronoi?: boolean;
  showDelaunay?: boolean;
  showPoints?: boolean;
  pointRadius?: number;
  randomSeed?: number;
  showBoundary?: boolean;
  fillCells?: boolean;
  fillDensity?: number;
  fillSeed?: number;
  palette?: string;
}

// Generate seed points according to pattern, all within radius r centred at (cx, cy)
const generatePoints = (
  n: number,
  pattern: Pattern,
  cx: number,
  cy: number,
  r: number,
  seed: number
): [number, number][] => {
  const points: [number, number][] = [];

  if (pattern === "phyllotaxis") {
    // Golden angle spiral — the natural packing used by sunflowers and pinecones
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const radius = r * Math.sqrt(i / n);
      const theta = i * goldenAngle;
      points.push([cx + radius * Math.cos(theta), cy + radius * Math.sin(theta)]);
    }
  } else if (pattern === "random") {
    // Seeded uniform random inside the circle via rejection sampling
    const rand = d3.randomLcg(seed);
    while (points.length < n) {
      const x = rand() * 2 - 1;
      const y = rand() * 2 - 1;
      if (x * x + y * y <= 1) {
        points.push([cx + x * r, cy + y * r]);
      }
    }
  } else if (pattern === "ring") {
    // Points on concentric rings — equal angular spacing per ring
    const rings = Math.max(1, Math.round(Math.sqrt(n / Math.PI)));
    let remaining = n;
    for (let ri = rings; ri >= 1 && remaining > 0; ri--) {
      const count = ri === 1 ? 1 : Math.min(remaining, Math.round((n * ri) / ((rings * (rings + 1)) / 2)));
      const radius = r * (ri / rings);
      for (let j = 0; j < count && remaining > 0; j++, remaining--) {
        const theta = (j / count) * 2 * Math.PI;
        points.push([cx + radius * Math.cos(theta), cy + radius * Math.sin(theta)]);
      }
    }
  } else {
    // Grid clipped to circle
    const cols = Math.ceil(Math.sqrt(n * 1.4));
    const step = (r * 2) / cols;
    for (let row = 0; row <= cols && points.length < n * 1.5; row++) {
      for (let col = 0; col <= cols && points.length < n * 1.5; col++) {
        const x = -r + step * col;
        const y = -r + step * row;
        if (x * x + y * y <= r * r) {
          points.push([cx + x, cy + y]);
        }
      }
    }
    points.splice(n);
  }

  return points;
};

const VoronoiLogo = ({
  size = 300,
  strokeColor = "#10a37f",
  strokeWidth = 1,
  opacity = 1,
  seeds = 40,
  pattern = "phyllotaxis",
  showVoronoi = true,
  showDelaunay = false,
  showPoints = false,
  pointRadius = 2,
  randomSeed = 42,
  showBoundary = true,
  fillCells = false,
  fillDensity = 0.5,
  fillSeed = 7,
  palette = "Observable10",
}: VoronoiLogoProps) => {
  const ref = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const s = d3.select(svg);
    s.selectAll("*").remove();

    const cx = size / 2;
    const cy = size / 2;
    const clipR = size * 0.45;

    const defs = s.append("defs");
    defs.append("clipPath").attr("id", "v-clip")
      .append("circle").attr("cx", cx).attr("cy", cy).attr("r", clipR);

    const g = s.append("g").attr("clip-path", "url(#v-clip)");

    const points = generatePoints(seeds, pattern, cx, cy, clipR, randomSeed);
    const delaunay = d3.Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, size, size]);

    if (fillCells) {
      const colors = schemes[palette] ?? schemes["Observable10"];
      const n = points.length;

      // Greedy graph coloring using Delaunay adjacency
      const colorIndex = new Array<number>(n).fill(-1);
      for (let i = 0; i < n; i++) {
        const usedColors = new Set<number>();
        for (const j of delaunay.neighbors(i)) {
          if (colorIndex[j] >= 0) usedColors.add(colorIndex[j]);
        }
        let c = 0;
        while (usedColors.has(c)) c++;
        colorIndex[i] = c % colors.length;
      }

      // Seeded random to decide which cells to fill
      const rand = d3.randomLcg(fillSeed);
      for (let i = 0; i < n; i++) {
        if (rand() < fillDensity) {
          g.append("path")
            .attr("d", voronoi.renderCell(i))
            .attr("fill", colors[colorIndex[i]])
            .attr("stroke", "none")
            .attr("opacity", opacity);
        }
      }
    }

    if (showVoronoi) {
      g.append("path")
        .attr("d", voronoi.render())
        .attr("fill", "none")
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opacity);
    }

    if (showDelaunay) {
      g.append("path")
        .attr("d", delaunay.render())
        .attr("fill", "none")
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opacity);
    }

    if (showPoints) {
      g.append("path")
        .attr("d", delaunay.renderPoints(undefined, pointRadius))
        .attr("fill", strokeColor)
        .attr("opacity", opacity);
    }

    // Bounding circle drawn outside the clip group so its stroke is never halved
    if (showBoundary) {
      s.append("circle")
        .attr("cx", cx).attr("cy", cy).attr("r", clipR)
        .attr("fill", "none")
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opacity);
    }
  }, [size, strokeColor, strokeWidth, opacity, seeds, pattern, showVoronoi, showDelaunay, showPoints, pointRadius, randomSeed, showBoundary, fillCells, fillDensity, fillSeed, palette]);

  return <LogoWrapper size={size} strokeColor={strokeColor} svgRef={ref} />;
};

export default VoronoiLogo;
