import * as d3 from "npm:d3";
import * as React from "npm:react";
import {schemes} from "./palettes.js";

interface Props {
  maxIter?: number;
  aspectRatio?: string;
  palette?: string;
}

// Precompute RGB lookup table for speed
const makeColorTable = (maxIter: number, palette: string): Uint8ClampedArray => {
  const colors = schemes[palette] ?? schemes["Magma"];
  const interpolate = d3.interpolateRgbBasis([...colors]);
  const table = new Uint8ClampedArray((maxIter + 1) * 3);
  for (let i = 0; i < maxIter; i++) {
    const c = d3.rgb(interpolate(Math.sqrt(i / maxIter)));
    table[i * 3] = c.r;
    table[i * 3 + 1] = c.g;
    table[i * 3 + 2] = c.b;
  }
  // Points inside the set → black
  table[maxIter * 3] = table[maxIter * 3 + 1] = table[maxIter * 3 + 2] = 0;
  return table;
};

// Initial complex-plane bounds
const IX1 = -2.5, IX2 = 1.0, IY1 = -1.2, IY2 = 1.2;

const renderMandelbrot = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  transform: d3.ZoomTransform,
  colorTable: Uint8ClampedArray,
  maxIter: number,
) => {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const ox = transform.invertX(px);
      const oy = transform.invertY(py);

      const cr = IX1 + (ox / width) * (IX2 - IX1);
      const ci = IY2 - (oy / height) * (IY2 - IY1);

      let zr = 0, zi = 0, n = 0;
      while (n < maxIter) {
        const zr2 = zr * zr, zi2 = zi * zi;
        if (zr2 + zi2 > 4) break;
        zi = 2 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
        n++;
      }

      const idx = (py * width + px) * 4;
      const ci3 = n * 3;
      data[idx] = colorTable[ci3];
      data[idx + 1] = colorTable[ci3 + 1];
      data[idx + 2] = colorTable[ci3 + 2];
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

const Mandelbrot = ({ maxIter = 256, aspectRatio = "69%", palette = "Magma" }: Props) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const width = el.offsetWidth;
    const height = el.offsetHeight;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    Object.assign(canvas.style, { display: "block", width: "100%", height: "100%", cursor: "crosshair" });
    el.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    const colorTable = makeColorTable(maxIter, palette);

    let rafId: number | null = null;

    const scheduleRender = (transform: d3.ZoomTransform) => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        renderMandelbrot(ctx, width, height, transform, colorTable, maxIter);
        rafId = null;
      });
    };

    // Initial render
    scheduleRender(d3.zoomIdentity);

    const zoom = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([1, 1e10])
      .on("zoom", (event: d3.D3ZoomEvent<HTMLCanvasElement, unknown>) => {
        scheduleRender(event.transform);
      });

    const sel = d3.select(canvas).call(zoom);

    // Double-click to reset
    sel.on("dblclick.zoom", () => {
      sel.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
    });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      el.innerHTML = "";
    };
  }, [maxIter, palette]);

  const style = { width: "100%", position: "relative" as const, paddingTop: aspectRatio };
  const innerStyle = { position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0 };

  return (
    <div style={style}>
      <div ref={containerRef} style={innerStyle} />
    </div>
  );
};

export default Mandelbrot;
