import * as d3 from "d3";
import * as React from "react";
import { type FeedStatus, OrderBookFeed, type Trade } from "./order-book";
import { drawDepth } from "./order-book-depth";

// ─── Constants ───────────────────────────────────────────────────────────────

const SAMPLE_MS = 250;
const COL_PX = 2; // width of one time column
const MAX_COLUMNS = 2000;
const PROFILE_ROW_PX = 3;
const PROFILE_SHARE = 0.3; // fraction of the top panel width given to the book
const TIME_H = 20;
const BUBBLE_MIN = 1.5;
const BUBBLE_MAX = 9;
const AXIS_W = 72;
const DEPTH_SHARE = 0.4; // fraction of the height given to the depth chart
const GAP = 16;
const DEPTH_AXIS_H = 20;
const BACKGROUND = "#0b0b12";
const TEXT = "#9ca3af";
const BID = "#4ade80";
const ASK = "#f87171";
const FONT = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

/** Depth bands for the imbalance, in basis points from the mid. Zero means the best prices only. */
const BANDS = [
  { name: "Top of book", bps: 0 },
  { name: "10 bps", bps: 10 },
  { name: "50 bps", bps: 50 },
  { name: "100 bps", bps: 100 },
];

const STATUS_TEXT: Record<FeedStatus, string> = {
  connecting: "Connecting to Binance…",
  syncing: "Syncing order book…",
  live: "",
  reconnecting: "Connection lost, reconnecting…",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  symbol?: string;
  /** Half the visible price window, in percent of the mid. */
  range?: number;
  aspectRatio?: string;
}

/** Mid price at one instant, plus the trades since the previous one. */
interface Column {
  mid: number;
  buyQty: number;
  buyValue: number;
  sellQty: number;
  sellValue: number;
}

interface TradeAccumulator {
  buyQty: number;
  buyValue: number;
  sellQty: number;
  sellValue: number;
  count: number;
}

const emptyTrades = (): TradeAccumulator => ({ buyQty: 0, buyValue: 0, sellQty: 0, sellValue: 0, count: 0 });

interface Stats {
  status: FeedStatus;
  mid: number;
  spread: number;
  /** One value per band, from −1 (all asks) to +1 (all bids). */
  imbalance: number[];
  tradesPerSec: number;
  decimals: number;
}

const decimalsFor = (tick: number) => (tick > 0 ? Math.max(0, Math.min(8, -Math.floor(Math.log10(tick) + 1e-9))) : 2);

/** (bid − ask) / (bid + ask) for the best prices and for each band around the mid. */
const imbalances = (feed: OrderBookFeed, bid: number, ask: number): number[] => {
  const mid = (bid + ask) / 2;
  const bidDepth = BANDS.map(() => 0);
  const askDepth = BANDS.map(() => 0);
  bidDepth[0] = feed.bids.get(bid) ?? 0;
  askDepth[0] = feed.asks.get(ask) ?? 0;
  for (const [price, qty] of feed.bids) {
    const bps = ((mid - price) / mid) * 1e4;
    for (let k = 1; k < BANDS.length; k++) if (bps <= BANDS[k].bps) bidDepth[k] += qty;
  }
  for (const [price, qty] of feed.asks) {
    const bps = ((price - mid) / mid) * 1e4;
    for (let k = 1; k < BANDS.length; k++) if (bps <= BANDS[k].bps) askDepth[k] += qty;
  }
  return BANDS.map((_, k) => {
    const total = bidDepth[k] + askDepth[k];
    return total > 0 ? (bidDepth[k] - askDepth[k]) / total : 0;
  });
};

// ─── Component ───────────────────────────────────────────────────────────────

const OrderBookChart = ({ symbol = "BTCUSDT", range = 0.25, aspectRatio = "80%" }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ w: 0, h: 0 });
  const [stats, setStats] = React.useState<Stats | null>(null);
  const feedRef = React.useRef<OrderBookFeed | null>(null);
  const tradesRef = React.useRef<TradeAccumulator>(emptyTrades());
  const columnsRef = React.useRef<Column[]>([]);
  /** 95th percentile of traded size per column side, where bubbles reach full size. */
  const tradeRefSize = React.useRef(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w && h) setDimensions({ w, h });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // One socket per symbol, plus a slow ticker for the stats bar.
  React.useEffect(() => {
    tradesRef.current = emptyTrades();
    columnsRef.current = [];
    tradeRefSize.current = 0;
    setStats(null);
    const onTrade = (trade: Trade) => {
      const acc = tradesRef.current;
      const value = trade.price * trade.qty;
      if (trade.buy) {
        acc.buyQty += trade.qty;
        acc.buyValue += value;
      } else {
        acc.sellQty += trade.qty;
        acc.sellValue += value;
      }
      acc.count++;
    };
    const onStatus = (status: FeedStatus) => setStats((s) => (s ? { ...s, status } : null));
    const feed = new OrderBookFeed(symbol, onTrade, onStatus);
    feedRef.current = feed;

    let ticks = 0;
    let tradeCount = 0;
    let statsAt = performance.now();
    const interval = setInterval(() => {
      if (feed.status !== "live") return;
      const bid = feed.bestBid();
      const ask = feed.bestAsk();
      if (!Number.isFinite(bid) || !Number.isFinite(ask)) return;

      const acc = tradesRef.current;
      tradesRef.current = emptyTrades();
      tradeCount += acc.count;
      const columns = columnsRef.current;
      columns.push({ mid: (bid + ask) / 2, ...acc });
      if (columns.length > MAX_COLUMNS) columns.splice(0, columns.length - MAX_COLUMNS);

      // Bubble area is proportional to size, measured against the large trades
      // so the scale works for any market.
      const traded = columns.flatMap((c) => [c.buyQty, c.sellQty]).filter((v) => v > 0);
      if (traded.length) tradeRefSize.current = d3.quantile(traded, 0.95) ?? 0;

      if (++ticks % 40 === 0) feed.prune((bid + ask) / 2, 0.05);
      if (ticks % 2) return;
      const now = performance.now();
      setStats({
        status: feed.status,
        mid: (bid + ask) / 2,
        spread: ask - bid,
        imbalance: imbalances(feed, bid, ask),
        tradesPerSec: (tradeCount * 1000) / (now - statsAt),
        decimals: decimalsFor(feed.tick),
      });
      tradeCount = 0;
      statsAt = now;
    }, SAMPLE_MS);

    return () => {
      clearInterval(interval);
      feed.close();
      feedRef.current = null;
    };
  }, [symbol]);

  React.useEffect(() => {
    const el = ref.current;
    const { w: W, h: H } = dimensions;
    if (!el || !W || !H) return;

    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.cssText = "width:100%;height:100%;display:block;border-radius:6px;";
    el.innerHTML = "";
    el.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const plotW = W - AXIS_W;
    const tradesW = Math.round(plotW * (1 - PROFILE_SHARE));
    const depthH = Math.round(H * DEPTH_SHARE);
    const plotH = Math.max(10, H - depthH - TIME_H);
    const depthArea = { x: 0, y: plotH + TIME_H + GAP, w: plotW, h: Math.max(10, depthH - GAP - DEPTH_AXIS_H) };
    const r = range / 100;

    let mouse: { x: number; y: number } | null = null;
    let frameId = 0;
    let lastVersion = -1;
    let lastCount = -1;
    let dirty = true;

    const drawProfile = (feed: OrderBookFeed, mid: number, decimals: number, yOf: (price: number) => number) => {
      const t = mid * (1 + r);
      const lo = mid * (1 - r);
      const rows = Math.ceil(plotH / PROFILE_ROW_PX);
      const bids = new Float64Array(rows);
      const asks = new Float64Array(rows);
      for (const [price, qty] of feed.bids) {
        if (price < lo || price > t) continue;
        bids[Math.min(rows - 1, Math.floor(yOf(price) / PROFILE_ROW_PX))] += qty;
      }
      for (const [price, qty] of feed.asks) {
        if (price < lo || price > t) continue;
        asks[Math.min(rows - 1, Math.floor(yOf(price) / PROFILE_ROW_PX))] += qty;
      }
      let max = 0;
      for (let i = 0; i < rows; i++) max = Math.max(max, bids[i], asks[i]);
      if (max) {
        const x0 = tradesW + 4;
        const width = plotW - tradesW - 8;
        for (let i = 0; i < rows; i++) {
          const y = i * PROFILE_ROW_PX;
          if (bids[i] > 0) {
            ctx.fillStyle = BID;
            ctx.fillRect(x0, y, (bids[i] / max) * width, PROFILE_ROW_PX - 1);
          }
          if (asks[i] > 0) {
            ctx.fillStyle = ASK;
            ctx.fillRect(x0, y, (asks[i] / max) * width, PROFILE_ROW_PX - 1);
          }
        }
      }

      // Price axis and current mid tag
      ctx.font = FONT;
      ctx.fillStyle = TEXT;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      for (const price of d3.ticks(lo, t, Math.max(3, Math.floor(plotH / 50)))) {
        const y = yOf(price);
        if (y < 8 || y > plotH - 8) continue;
        ctx.fillRect(plotW, y, 4, 1);
        ctx.fillText(price.toFixed(decimals), plotW + 7, y);
      }
      const y = yOf(mid);
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(plotW + 2, y - 8, AXIS_W - 4, 16);
      ctx.fillStyle = "#111";
      ctx.fillText(mid.toFixed(decimals), plotW + 7, y);
    };

    const drawTrades = (yOf: (price: number) => number) => {
      const cols = columnsRef.current;
      const columnX = (i: number) => tradesW - (cols.length - i) * COL_PX + COL_PX / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, tradesW, plotH);
      ctx.clip();

      // Mid price trail
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      cols.forEach((col, i) => {
        const x = columnX(i);
        if (x < -COL_PX) return;
        ctx.lineTo(x, yOf(col.mid));
      });
      ctx.stroke();

      // Trades, one bubble per side per column at the volume weighted price
      const ref = tradeRefSize.current;
      const bubble = (x: number, y: number, size: number, color: string) => {
        const radius = Math.min(BUBBLE_MAX, Math.max(BUBBLE_MIN, BUBBLE_MAX * Math.sqrt(size / (ref || size))));
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      };
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = BACKGROUND;
      cols.forEach((col, i) => {
        const x = columnX(i);
        if (x < -BUBBLE_MAX) return;
        if (col.buyQty > 0) bubble(x, yOf(col.buyValue / col.buyQty), col.buyQty, BID);
        if (col.sellQty > 0) bubble(x, yOf(col.sellValue / col.sellQty), col.sellQty, ASK);
      });
      ctx.globalAlpha = 1;
      ctx.restore();

      // Time axis
      const secondsPerPx = SAMPLE_MS / 1000 / COL_PX;
      const step = [5, 10, 15, 30, 60, 120, 300].find((s) => s / secondsPerPx >= 70) ?? 300;
      ctx.font = FONT;
      ctx.fillStyle = TEXT;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let k = 1; ; k++) {
        const x = tradesW - (k * step) / secondsPerPx;
        if (x < 20) break;
        ctx.fillRect(x, plotH, 1, 4);
        ctx.fillText(step >= 60 ? `−${(k * step) / 60}m` : `−${k * step}s`, x, plotH + 5);
      }
      ctx.textAlign = "right";
      ctx.fillText("now", tradesW - 2, plotH + 5);
    };

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      const feed = feedRef.current;
      const count = columnsRef.current.length;
      if (!feed || (!dirty && feed.version === lastVersion && count === lastCount)) return;
      lastCount = count;
      dirty = false;
      lastVersion = feed.version;

      ctx.fillStyle = BACKGROUND;
      ctx.fillRect(0, 0, W, H);

      const bid = feed.bestBid();
      const ask = feed.bestAsk();
      if (feed.status !== "live" || !Number.isFinite(bid) || !Number.isFinite(ask)) {
        ctx.fillStyle = TEXT;
        ctx.font = "14px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(STATUS_TEXT[feed.status] || "Waiting for data…", W / 2, H / 2);
        dirty = true;
        return;
      }

      const decimals = decimalsFor(feed.tick);
      const mid = (bid + ask) / 2;
      const yOf = (price: number) => ((mid * (1 + r) - price) / (2 * mid * r)) * plotH;
      drawTrades(yOf);
      drawProfile(feed, mid, decimals, yOf);
      drawDepth(ctx, feed, depthArea, r, decimals, mouse, {
        bid: BID,
        ask: ASK,
        text: TEXT,
        font: FONT,
        background: BACKGROUND,
      });
    };

    const onMove = (event: MouseEvent) => {
      mouse = { x: event.offsetX, y: event.offsetY };
      dirty = true;
    };
    const onLeave = () => {
      mouse = null;
      dirty = true;
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    draw();

    return () => {
      cancelAnimationFrame(frameId);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [dimensions, symbol, range]);

  const outerStyle: React.CSSProperties = { width: "100%", position: "relative", paddingTop: aspectRatio };
  const innerStyle: React.CSSProperties = { position: "absolute", top: 0, left: 0, bottom: 0, right: 0 };

  return (
    <>
      <div style={outerStyle}>
        <div ref={ref} style={innerStyle} />
      </div>
      <StatsBar stats={stats} />
    </>
  );
};

const StatsBar = ({ stats }: { stats: Stats | null }) => {
  if (!stats) return <div className="text-sm mt-2 text-[var(--foreground-faint)]">Connecting…</div>;
  const live = stats.status === "live";
  const items: [string, string][] = [
    ["Mid", stats.mid.toFixed(stats.decimals)],
    ["Spread", stats.spread.toFixed(stats.decimals)],
    ["Trades/s", stats.tradesPerSec.toFixed(1)],
  ];
  return (
    <div className="text-sm mt-2 tabular-nums text-[var(--foreground-faint)]">
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <span>
          <span style={{ color: live ? BID : "#facc15" }}>●</span> {live ? "Live" : stats.status}
        </span>
        {items.map(([name, value]) => (
          <span key={name}>
            {name} <span className="text-[var(--foreground)]">{value}</span>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
        <span>Imbalance</span>
        {BANDS.map((band, k) => {
          const v = stats.imbalance[k];
          return (
            <span key={band.name}>
              {band.name}{" "}
              <span style={{ color: v >= 0 ? BID : ASK }}>
                {v >= 0 ? "+" : ""}
                {(v * 100).toFixed(1)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default OrderBookChart;
