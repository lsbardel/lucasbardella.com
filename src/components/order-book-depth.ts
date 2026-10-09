import * as d3 from "d3";
import type { OrderBookFeed } from "./order-book";

// Classic cumulative depth chart: total size available from the touch out to
// each price, bids stepping down to the left of the mid and asks to the right.
// Hovering reads off how much size, and value, sits between the mid and a price,
// which is what a market order would have to eat to push the price there.

export interface DepthArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DepthStyle {
  bid: string;
  ask: string;
  text: string;
  font: string;
  background: string;
}

interface CumLevel {
  price: number;
  size: number;
  value: number;
}

/** Levels inside the window, ordered from the touch outwards, with running totals. */
const cumulate = (book: Map<number, number>, inside: (price: number) => boolean, descending: boolean): CumLevel[] => {
  const levels = [...book].filter(([price]) => inside(price));
  levels.sort((a, b) => (descending ? b[0] - a[0] : a[0] - b[0]));
  let size = 0;
  let value = 0;
  return levels.map(([price, qty]) => {
    size += qty;
    value += price * qty;
    return { price, size, value };
  });
};

const formatSize = d3.format(".4~s");
const formatValue = d3.format(",.0f");

export const drawDepth = (
  ctx: CanvasRenderingContext2D,
  feed: OrderBookFeed,
  area: DepthArea,
  range: number,
  decimals: number,
  mouse: { x: number; y: number } | null,
  style: DepthStyle,
) => {
  const bestBid = feed.bestBid();
  const bestAsk = feed.bestAsk();
  if (!Number.isFinite(bestBid) || !Number.isFinite(bestAsk)) return;
  const mid = (bestBid + bestAsk) / 2;
  const lo = mid * (1 - range);
  const hi = mid * (1 + range);
  const bids = cumulate(feed.bids, (p) => p >= lo, true);
  const asks = cumulate(feed.asks, (p) => p <= hi, false);
  const max = Math.max(bids.at(-1)?.size ?? 0, asks.at(-1)?.size ?? 0) * 1.08 || 1;

  const x = (price: number) => area.x + ((price - lo) / (hi - lo)) * area.w;
  const y = (size: number) => area.y + area.h - (size / max) * area.h;
  const bottom = area.y + area.h;

  // Axes
  ctx.font = style.font;
  ctx.fillStyle = style.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (const size of d3.ticks(0, max, Math.max(2, Math.floor(area.h / 35)))) {
    const ty = Math.round(y(size)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(area.x, ty);
    ctx.lineTo(area.x + area.w, ty);
    ctx.stroke();
    ctx.fillText(formatSize(size), area.x + area.w + 7, ty);
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const price of d3.ticks(lo, hi, Math.max(3, Math.floor(area.w / 110)))) {
    const tx = x(price);
    if (tx < area.x + 30 || tx > area.x + area.w - 30) continue;
    ctx.fillRect(tx, bottom, 1, 4);
    ctx.fillText(price.toFixed(decimals), tx, bottom + 5);
  }

  // Step areas, filled faintly and outlined
  const trace = (levels: CumLevel[], edge: number) => {
    let previous = 0;
    ctx.moveTo(x(levels[0].price), y(0));
    for (const level of levels) {
      ctx.lineTo(x(level.price), y(previous));
      ctx.lineTo(x(level.price), y(level.size));
      previous = level.size;
    }
    ctx.lineTo(x(edge), y(previous));
  };
  const side = (levels: CumLevel[], edge: number, color: string) => {
    if (!levels.length) return;
    ctx.beginPath();
    trace(levels, edge);
    ctx.lineTo(x(edge), y(0));
    ctx.closePath();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    trace(levels, edge);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };
  side(bids, lo, style.bid);
  side(asks, hi, style.ask);

  // Mid marker
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x(mid), area.y);
  ctx.lineTo(x(mid), bottom);
  ctx.stroke();
  ctx.setLineDash([]);

  if (!mouse || mouse.x < area.x || mouse.x > area.x + area.w || mouse.y < area.y || mouse.y > bottom) return;

  // Hover readout: everything between the touch and the hovered price
  const price = lo + ((mouse.x - area.x) / area.w) * (hi - lo);
  const isBid = price < mid;
  const levels = isBid ? bids : asks;
  let reached: CumLevel | undefined;
  for (const level of levels) {
    if (isBid ? level.price < price : level.price > price) break;
    reached = level;
  }
  const size = reached?.size ?? 0;
  const value = reached?.value ?? 0;
  const color = isBid ? style.bid : style.ask;

  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.moveTo(mouse.x, area.y);
  ctx.lineTo(mouse.x, bottom);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(mouse.x, y(size), 3.5, 0, Math.PI * 2);
  ctx.fill();

  const move = (price / mid - 1) * 100;
  const lines = [
    `${price.toFixed(decimals)}  ${move >= 0 ? "+" : ""}${move.toFixed(3)}%`,
    `${isBid ? "Bids" : "Asks"} ${formatSize(size)}`,
    `${formatValue(value)} USDT`,
  ];
  const boxW = Math.max(...lines.map((line) => ctx.measureText(line).width)) + 14;
  const boxH = lines.length * 15 + 8;
  const bx = mouse.x + 12 + boxW > area.x + area.w ? mouse.x - 12 - boxW : mouse.x + 12;
  const by = Math.max(area.y, Math.min(bottom - boxH, mouse.y - boxH / 2));
  ctx.fillStyle = style.background;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(bx, by, boxW, boxH);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.strokeRect(bx + 0.5, by + 0.5, boxW - 1, boxH - 1);
  ctx.fillStyle = "#e5e7eb";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  lines.forEach((line, i) => ctx.fillText(line, bx + 7, by + 5 + i * 15));
};
