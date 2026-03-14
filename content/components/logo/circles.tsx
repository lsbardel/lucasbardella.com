import * as React from "npm:react";
import * as d3 from "npm:d3";
import { type BaseLogoProps, LogoWrapper } from "./base.js";

type ClipMode = "none" | "outer" | "inner" | "petals";

export interface CirclesLogoProps extends BaseLogoProps {
  rotation?: number;
  petals?: number;
  clip?: ClipMode;
  innerRadius?: number; // 0–1: fraction of full petal extent (2R); 0 = no bounding circle
  fillPetals?: boolean; // fill the lens-shaped intersections between adjacent circles
  showChords?: boolean; // draw the chord across each circle connecting its two outer intersection points
}

// The logo is built from `petals` overlapping circles arranged in rotational
// symmetry. Each circle is centered at distance R from the origin with radius R,
// so every circle passes through the centre.
//
// Every pair of adjacent circles intersects at two points. One is always the
// origin (since all circles pass through it). The other lies at distance
// 2R·cos(π/n) from the origin along the bisector of the two centres.
// This gives a clean lens (vesica) path: M 0,0 A ... Q2 A ... 0,0 Z.
//
// In "petals" mode only the outer arc of each circle is drawn — the arc between
// the two intersection points with its neighbours.

const CirclesLogo = ({
  size = 300,
  strokeColor = "#10a37f",
  strokeWidth = 2,
  opacity = 1,
  rotation = 0,
  petals = 8,
  clip = "none",
  innerRadius = 0.675,
  fillPetals = false,
  showChords = false,
}: CirclesLogoProps) => {
  const ref = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const s = d3.select(svg);
    s.selectAll("*").remove();

    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.22;
    const rPx = innerRadius * 2 * R;

    const defs = s.append("defs");
    const g = s.append("g").attr("transform", `translate(${cx},${cy})`);

    if (rPx > 0 && clip === "outer") {
      defs.append("clipPath").attr("id", "lf-clip")
        .append("circle").attr("r", rPx);
    }

    if (rPx > 0 && clip === "inner") {
      const half = size;
      const rectPath = `M ${-half},${-half} H ${half} V ${half} H ${-half} Z`;
      const circlePath = `M ${-rPx},0 A ${rPx},${rPx} 0 1,0 ${rPx},0 A ${rPx},${rPx} 0 1,0 ${-rPx},0 Z`;
      defs.append("clipPath").attr("id", "lf-clip")
        .append("path").attr("d", `${rectPath} ${circlePath}`).attr("clip-rule", "evenodd");
    }

    const wheel = g.append("g").attr("transform", `rotate(${rotation})`);
    if (rPx > 0 && (clip === "outer" || clip === "inner")) {
      wheel.attr("clip-path", "url(#lf-clip)");
    }

    if (clip === "petals") {
      const delta = (2 * Math.PI) / petals;
      const largeArc = 2 * delta > Math.PI ? 1 : 0;
      for (let i = 0; i < petals; i++) {
        const alpha = (i / petals) * 2 * Math.PI;
        const ox = R * Math.cos(alpha);
        const oy = R * Math.sin(alpha);
        const x1 = ox + R * Math.cos(alpha - delta);
        const y1 = oy + R * Math.sin(alpha - delta);
        const x2 = ox + R * Math.cos(alpha + delta);
        const y2 = oy + R * Math.sin(alpha + delta);
        wheel.append("path")
          .attr("d", `M ${x1},${y1} A ${R},${R} 0 ${largeArc},1 ${x2},${y2}`)
          .attr("fill", "none")
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth)
          .attr("opacity", opacity);
      }
    } else {
      if (fillPetals) {
        const q2dist = 2 * R * Math.cos(Math.PI / petals);
        for (let i = 0; i < petals; i++) {
          const alphaI = (i / petals) * 2 * Math.PI;
          const alphaJ = ((i + 1) / petals) * 2 * Math.PI;
          const alphaMid = (alphaI + alphaJ) / 2;
          const q2x = q2dist * Math.cos(alphaMid);
          const q2y = q2dist * Math.sin(alphaMid);
          wheel.append("path")
            .attr("d", `M 0,0 A ${R},${R} 0 0,0 ${q2x},${q2y} A ${R},${R} 0 0,0 0,0 Z`)
            .attr("fill", strokeColor)
            .attr("fill-opacity", opacity)
            .attr("stroke", "none");
        }
      }

      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * 2 * Math.PI;
        wheel.append("circle")
          .attr("cx", R * Math.cos(angle))
          .attr("cy", R * Math.sin(angle))
          .attr("r", R)
          .attr("fill", "none")
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth)
          .attr("opacity", opacity);
      }

      if (showChords) {
        const q2dist = 2 * R * Math.cos(Math.PI / petals);
        for (let i = 0; i < petals; i++) {
          const alpha = (i / petals) * 2 * Math.PI;
          const x1 = q2dist * Math.cos(alpha - Math.PI / petals);
          const y1 = q2dist * Math.sin(alpha - Math.PI / petals);
          const x2 = q2dist * Math.cos(alpha + Math.PI / petals);
          const y2 = q2dist * Math.sin(alpha + Math.PI / petals);
          wheel.append("line")
            .attr("x1", x1).attr("y1", y1)
            .attr("x2", x2).attr("y2", y2)
            .attr("stroke", strokeColor)
            .attr("stroke-width", strokeWidth)
            .attr("opacity", opacity);
        }
      }

      if (rPx > 0) {
        g.append("circle")
          .attr("cx", 0).attr("cy", 0).attr("r", rPx)
          .attr("fill", "none")
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth)
          .attr("opacity", opacity);
      }
    }
  }, [size, strokeColor, strokeWidth, opacity, rotation, petals, clip, innerRadius, fillPetals, showChords]);

  return <LogoWrapper size={size} strokeColor={strokeColor} svgRef={ref} />;
};

export default CirclesLogo;
