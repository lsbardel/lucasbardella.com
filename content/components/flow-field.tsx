import * as React from "npm:react";

// ─── Perlin noise ────────────────────────────────────────────────────────────

function makeNoise(seed: number): (x: number, y: number) => number {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = (seed ^ 0xdeadbeef) >>> 0;
  for (let i = 255; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (h: number, x: number, y: number) =>
    ((h & 1) ? -x : x) + ((h & 2) ? -y : y);

  return (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x), v = fade(y);
    const a = perm[X] + Y, b = perm[X + 1] + Y;
    return lerp(v,
      lerp(u, grad(perm[a],     x,     y    ), grad(perm[b],     x - 1, y    )),
      lerp(u, grad(perm[a + 1], x,     y - 1), grad(perm[b + 1], x - 1, y - 1)),
    );
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlowFieldProps {
  particleCount?: number;
  speed?: number;
  noiseScale?: number;
  trailFade?: number;
  colors?: readonly string[];
  background?: string;
  seed?: number;
  aspectRatio?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const FlowField = ({
  particleCount = 3000,
  speed = 1.2,
  noiseScale = 0.0035,
  trailFade = 10,
  colors = d3.schemeTableau10,
  background = "#0a0a0f",
  seed = 42,
  aspectRatio = "75%",
}: FlowFieldProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const W = el.offsetWidth || 900;
    const H = el.offsetHeight || 675;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    canvas.style.cssText = "width:100%;height:100%;display:block;";
    el.innerHTML = "";
    el.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    const noise = makeNoise(seed);

    // Seeded LCG for reproducible initial positions
    let rngState = (seed * 1664525 + 1013904223) >>> 0;
    const rng = () => {
      rngState = (Math.imul(rngState, 1664525) + 1013904223) >>> 0;
      return rngState / 0xffffffff;
    };

    const N = particleCount;
    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const pcol = new Uint8Array(N);
    const NC = colors.length;

    for (let i = 0; i < N; i++) {
      px[i] = rng() * W;
      py[i] = rng() * H;
      pcol[i] = Math.floor(rng() * NC);
    }

    const transparent = !background || background === "transparent";
    if (!transparent) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, W, H);
    }

    const TWO_PI = Math.PI * 2;
    const fadeA = 1 / trailFade;

    let animId: number;

    const frame = () => {
      const cW = canvas.width;
      const cH = canvas.height;
      ctx.globalAlpha = fadeA;
      if (transparent) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, cW, cH);
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, cW, cH);
      }
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = 0.9;

      for (let i = 0; i < N; i++) {
        const x = px[i], y = py[i];
        const angle =
          noise(x * noiseScale,            y * noiseScale           ) * TWO_PI * 2.5 +
          noise(x * noiseScale * 2.1 + 73, y * noiseScale * 2.1 + 31) * TWO_PI * 0.6;

        const nx = x + Math.cos(angle) * speed;
        const ny = y + Math.sin(angle) * speed;

        ctx.beginPath();
        ctx.strokeStyle = colors[pcol[i]];
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        if (nx < 0 || nx > cW || ny < 0 || ny > cH) {
          const edge = Math.random() < 0.5;
          px[i] = edge ? Math.random() * cW : (Math.random() < 0.5 ? 0 : cW);
          py[i] = edge ? (Math.random() < 0.5 ? 0 : cH) : Math.random() * cH;
        } else {
          px[i] = nx;
          py[i] = ny;
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(frame);
    };

    frame();
    return () => cancelAnimationFrame(animId);
  }, [particleCount, speed, noiseScale, trailFade, colors, background, seed]);

  const outerStyle: React.CSSProperties = { width: "100%", position: "relative", paddingTop: aspectRatio };
  const innerStyle: React.CSSProperties = { position: "absolute", top: 0, left: 0, bottom: 0, right: 0 };

  return (
    <div style={outerStyle}>
      <div ref={ref} style={innerStyle} />
    </div>
  );
};

export default FlowField;
