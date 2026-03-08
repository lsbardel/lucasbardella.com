import * as d3 from "npm:d3";
import * as React from "npm:react";
import {schemes} from "./palettes.js";

interface Props {
  radius?: number;
  ny?: number;
  nx?: number;
  color?: string;
  nParticles?: number;
  palette?: string;
  aspectRatio?: string;
}

interface Point { x: number; y: number; }
interface Particle { x: number; y: number; }

const velocity = (x: number, y: number, a2: number): [number, number] => {
  const r2 = x * x + y * y;
  if (r2 <= a2) return [0, 0];
  const r4 = r2 * r2;
  return [1 - a2 * (x * x - y * y) / r4, -2 * a2 * x * y / r4];
};

const randomInlet = (sm: number): Particle => ({
  x: -0.5,
  y: (Math.random() * 2 - 1) * sm,
});

const CP_MIN = -3, CP_MAX = 1;

const drawCylinder = (
  el: HTMLDivElement,
  props: Required<Omit<Props, "aspectRatio">>,
): () => void => {
  const { radius, ny, nx, color, nParticles, palette } = props;
  const width = el.offsetWidth;
  const height = el.offsetHeight;

  const a2 = radius * radius;
  const sm = (0.5 * height) / width;
  const dy = sm / ny;

  const scalex = d3.scaleLinear().range([0, width]).domain([-0.5, 0.5]);
  const scaley = d3.scaleLinear().range([0, height]).domain([-sm, sm]);
  const scaler = d3.scaleLinear().range([0, width]).domain([0, 1]);

  // --- Layer 1: pressure field on canvas (drawn once, pixel-perfect cylinder cutout) ---
  const pressureCanvas = document.createElement("canvas");
  pressureCanvas.width = width;
  pressureCanvas.height = height;
  Object.assign(pressureCanvas.style, { position: "absolute", top: "0px", left: "0px" });
  el.appendChild(pressureCanvas);
  const pCtx = pressureCanvas.getContext("2d")!;

  // Precompute colour LUT from palette
  const colors = schemes[palette] ?? schemes["Spectral"];
  const interpolate = d3.interpolateRgbBasis([...colors]);
  const LUT = 512;
  const lut = new Uint8ClampedArray(LUT * 3);
  for (let i = 0; i < LUT; i++) {
    const c = d3.rgb(interpolate(i / (LUT - 1)));
    lut[i * 3] = c.r; lut[i * 3 + 1] = c.g; lut[i * 3 + 2] = c.b;
  }

  const imageData = pCtx.createImageData(width, height);
  const px_data = imageData.data;
  const alpha = Math.round(0.45 * 255);

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const x = -0.5 + px / (width - 1);
      const y = sm * (1 - 2 * py / (height - 1));
      const r2 = x * x + y * y;
      if (r2 > a2) {
        const [vx, vy] = velocity(x, y, a2);
        const cp = Math.max(CP_MIN, Math.min(CP_MAX, 1 - vx * vx - vy * vy));
        const ti = Math.round((cp - CP_MIN) / (CP_MAX - CP_MIN) * (LUT - 1));
        const idx = (py * width + px) * 4;
        px_data[idx]     = lut[ti * 3];
        px_data[idx + 1] = lut[ti * 3 + 1];
        px_data[idx + 2] = lut[ti * 3 + 2];
        px_data[idx + 3] = alpha;
        // pixels inside cylinder stay transparent (alpha = 0)
      }
    }
  }
  pCtx.putImageData(imageData, 0, 0);

  // --- Layer 2: SVG for streamlines + cylinder circle ---
  const svg = d3.select(el).append("svg")
    .attr("width", width).attr("height", height)
    .style("position", "absolute").style("top", "0px").style("left", "0px");

  const lineup = d3.line<Point>().x((d) => scalex(d.x)).y((d) => scaley(d.y)).curve(d3.curveCardinal);
  const linedo = d3.line<Point>().x((d) => scalex(d.x)).y((d) => scaley(-d.y)).curve(d3.curveCardinal);

  const data: Point[][] = [];
  for (let j = 0; j < ny; ++j) {
    const m = j ? j : 0.3;
    const y0 = m * dy, x0 = 0.5;
    const r0 = Math.sqrt(x0 * x0 + y0 * y0);
    const theta0 = Math.atan2(y0, x0);
    const thetaN = 0.5 * Math.PI - theta0;
    const dd = (0.5 * Math.PI) / nx;
    const phi = (a2 / r0 - r0) * Math.sin(theta0);

    const linedata: Point[] = new Array(2 * nx + 1);
    linedata[0] = { x: -x0, y: y0 };
    linedata[2 * nx] = { x: x0, y: y0 };
    for (let i = 1; i < nx; ++i) {
      const theta = theta0 + thetaN * (1 - Math.cos(i * dd));
      const stheta = Math.sin(theta);
      const p = phi / stheta;
      const r = 0.5 * (Math.sqrt(p * p + 4 * a2) - p);
      linedata[i] = { x: -r * Math.cos(theta), y: r * stheta };
      linedata[2 * nx - i] = { x: r * Math.cos(theta), y: r * stheta };
    }
    linedata[nx] = { x: 0, y: 0.5 * (Math.sqrt(phi * phi + 4 * a2) - phi) };
    data.push(linedata);
  }

  const pathAttrs = (sel: d3.Selection<SVGPathElement, Point[], SVGSVGElement, unknown>) =>
    sel.attr("stroke", color).attr("stroke-width", 1).attr("fill", "none");

  svg.selectAll<SVGPathElement, Point[]>("path.up")
    .data(data).enter().append("path").classed("up", true)
    .attr("d", (d) => lineup(d)).call(pathAttrs);
  svg.selectAll<SVGPathElement, Point[]>("path.down")
    .data(data).enter().append("path").classed("down", true)
    .attr("d", (d) => linedo(d)).call(pathAttrs);

  svg.append("circle")
    .attr("cx", scalex(0)).attr("cy", scaley(0)).attr("r", scaler(radius))
    .attr("fill", "#61A0FF");

  // --- Layer 3: animated particles canvas ---
  const partCanvas = document.createElement("canvas");
  partCanvas.width = width;
  partCanvas.height = height;
  Object.assign(partCanvas.style, { position: "absolute", top: "0px", left: "0px", pointerEvents: "none" });
  el.appendChild(partCanvas);
  const ctx = partCanvas.getContext("2d")!;

  const speedColor = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 2.5]);
  const particles: Particle[] = Array.from({ length: nParticles }, () => ({
    x: Math.random() - 0.5,
    y: (Math.random() * 2 - 1) * sm,
  }));

  const dt = 0.004;
  let rafId: number;
  const step = () => {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      const [vx, vy] = velocity(p.x, p.y, a2);
      const speed = Math.sqrt(vx * vx + vy * vy);
      p.x += vx * dt;
      p.y += vy * dt;
      const r2 = p.x * p.x + p.y * p.y;
      if (p.x > 0.52 || p.x < -0.52 || Math.abs(p.y) > sm + 0.02 || r2 < a2 * 1.05) {
        Object.assign(p, randomInlet(sm));
      }
      ctx.beginPath();
      ctx.arc(scalex(p.x), scaley(p.y), 2, 0, 2 * Math.PI);
      ctx.fillStyle = speedColor(speed);
      ctx.fill();
    }
    rafId = requestAnimationFrame(step);
  };

  rafId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(rafId);
};

const Cylinder = ({
  radius = 0.1, ny = 30, nx = 20, color = "#999999",
  nParticles = 300, palette = "Spectral", aspectRatio = "70%",
}: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanup = drawCylinder(el, { radius, ny, nx, color, nParticles, palette });
    return () => { cleanup(); el.innerHTML = ""; };
  }, [radius, ny, nx, color, nParticles, palette]);

  const style = { width: "100%", position: "relative" as const, paddingTop: aspectRatio };
  const innerStyle = { position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0 };

  return (
    <div style={style}>
      <div ref={ref} style={innerStyle} />
    </div>
  );
};

export default Cylinder;
