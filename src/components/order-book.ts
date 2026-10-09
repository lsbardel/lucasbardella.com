// Live Binance spot order book, kept in sync from the public market data feeds.
//
// Binance publishes no full book over the socket, only diffs. The local book is
// rebuilt the way their docs describe: open the diff stream and buffer it, fetch
// a REST snapshot, drop the buffered diffs the snapshot already contains, then
// apply the rest in sequence. Any gap in the update ids means a missed message,
// so the book is thrown away and synced again. Both endpoints are public and
// need no key, and the REST one sends `access-control-allow-origin: *`.

export type FeedStatus = "connecting" | "syncing" | "live" | "reconnecting";

export interface Trade {
  price: number;
  qty: number;
  time: number;
  /** True when the aggressor was the buyer. */
  buy: boolean;
}

type Level = [string, string];

interface DepthUpdate {
  U: number;
  u: number;
  b: Level[];
  a: Level[];
}

interface AggTrade {
  p: string;
  q: string;
  T: number;
  m: boolean;
}

interface Snapshot {
  lastUpdateId: number;
  bids: Level[];
  asks: Level[];
}

interface StreamMessage {
  stream: string;
  data: DepthUpdate | AggTrade;
}

const STREAM_URL = "wss://data-stream.binance.vision/stream";
const DEPTH_URL = "https://data-api.binance.vision/api/v3/depth";
// 5000 levels costs 250 of the 6000 per minute request weight, so resyncs are spaced out.
const SNAPSHOT_LIMIT = 5000;
const MIN_RESYNC_MS = 2000;

/** Smallest price step seen in the snapshot, a good enough proxy for the tick size. */
const estimateTick = (levels: Level[]): number => {
  let tick = Infinity;
  for (let i = 1; i < Math.min(levels.length, 200); i++) {
    const diff = Math.abs(Number(levels[i - 1][0]) - Number(levels[i][0]));
    if (diff > 0) tick = Math.min(tick, diff);
  }
  return Number.isFinite(tick) ? Number(tick.toPrecision(6)) : 0;
};

export class OrderBookFeed {
  readonly bids = new Map<number, number>();
  readonly asks = new Map<number, number>();
  tick = 0;
  status: FeedStatus = "connecting";
  /** Bumped on every applied update, so renderers know when to redraw. */
  version = 0;

  private ws?: WebSocket;
  private lastId = -1;
  private buffer: DepthUpdate[] = [];
  private syncing = false;
  private lastSync = 0;
  private closed = false;
  private retries = 0;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    readonly symbol: string,
    private readonly onTrade: (trade: Trade) => void,
    private readonly onStatus: (status: FeedStatus) => void,
  ) {
    this.connect();
  }

  close() {
    this.closed = true;
    clearTimeout(this.timer);
    this.ws?.close();
  }

  bestBid(): number {
    let best = -Infinity;
    for (const price of this.bids.keys()) if (price > best) best = price;
    return best;
  }

  bestAsk(): number {
    let best = Infinity;
    for (const price of this.asks.keys()) if (price < best) best = price;
    return best;
  }

  /** Drops levels far from the mid so the maps do not grow without bound. */
  prune(mid: number, fraction: number) {
    const lo = mid * (1 - fraction);
    const hi = mid * (1 + fraction);
    for (const price of this.bids.keys()) if (price < lo) this.bids.delete(price);
    for (const price of this.asks.keys()) if (price > hi) this.asks.delete(price);
  }

  private setStatus(status: FeedStatus) {
    this.status = status;
    this.onStatus(status);
  }

  private connect() {
    const name = this.symbol.toLowerCase();
    const ws = new WebSocket(`${STREAM_URL}?streams=${name}@depth@100ms/${name}@aggTrade`);
    this.ws = ws;
    this.lastId = -1;
    this.buffer = [];
    ws.onopen = () => {
      this.retries = 0;
      this.resync();
    };
    ws.onmessage = (event: MessageEvent<string>) => {
      const message = JSON.parse(event.data) as StreamMessage;
      if (message.stream.endsWith("@aggTrade")) {
        const trade = message.data as AggTrade;
        this.onTrade({ price: Number(trade.p), qty: Number(trade.q), time: trade.T, buy: !trade.m });
      } else {
        this.onDepth(message.data as DepthUpdate);
      }
    };
    ws.onclose = () => {
      if (this.closed || ws !== this.ws) return;
      this.setStatus("reconnecting");
      const delay = Math.min(15000, 1000 * 2 ** this.retries++);
      this.timer = setTimeout(() => this.connect(), delay);
    };
  }

  private onDepth(update: DepthUpdate) {
    if (this.lastId < 0) {
      this.buffer.push(update);
      return;
    }
    if (update.u <= this.lastId) return;
    // The first diff after the snapshot must straddle it, and every later one
    // must follow on from the previous. Either way a jump means data was lost.
    if (update.U > this.lastId + 1) {
      this.resync();
      return;
    }
    this.apply(update);
  }

  private apply(update: DepthUpdate) {
    for (const [p, q] of update.b) {
      const qty = Number(q);
      if (qty === 0) this.bids.delete(Number(p));
      else this.bids.set(Number(p), qty);
    }
    for (const [p, q] of update.a) {
      const qty = Number(q);
      if (qty === 0) this.asks.delete(Number(p));
      else this.asks.set(Number(p), qty);
    }
    this.lastId = update.u;
    this.version++;
  }

  private async resync() {
    if (this.syncing) return;
    this.syncing = true;
    this.lastId = -1;
    this.buffer = [];
    this.setStatus("syncing");
    const ws = this.ws;
    try {
      const wait = this.lastSync + MIN_RESYNC_MS - Date.now();
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      this.lastSync = Date.now();
      const response = await fetch(`${DEPTH_URL}?symbol=${this.symbol}&limit=${SNAPSHOT_LIMIT}`);
      if (!response.ok) throw new Error(`depth snapshot returned ${response.status}`);
      const snapshot = (await response.json()) as Snapshot;
      if (this.closed || ws !== this.ws) return;
      this.bids.clear();
      this.asks.clear();
      for (const [p, q] of snapshot.bids) this.bids.set(Number(p), Number(q));
      for (const [p, q] of snapshot.asks) this.asks.set(Number(p), Number(q));
      this.tick = estimateTick(snapshot.bids);
      this.lastId = snapshot.lastUpdateId;
      this.version++;
      this.syncing = false;
      const pending = this.buffer;
      this.buffer = [];
      for (const update of pending) this.onDepth(update);
      if (this.lastId >= 0) this.setStatus("live");
    } catch (error) {
      console.error(error);
      this.syncing = false;
      // Closing hands recovery to the reconnect path and its backoff.
      if (!this.closed && ws === this.ws) ws?.close();
    }
  }
}
