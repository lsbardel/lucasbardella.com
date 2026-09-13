/**
 * Verifies which TradingView heatmap datasets actually load, and rewrites
 * `lsts/heatmap-verified.json`.
 *
 * The `DataSets` enum is shared across the stock, ETF and crypto heatmaps. For
 * anything the stock widget cannot serve it silently renders S&P 500 instead,
 * with no error, so an unsupported market looks like a broken page rather than
 * a bad identifier. Roughly half the enum behaves this way.
 *
 * The widget prints the dataset it actually loaded in its top bar, which is the
 * only reliable oracle. Each candidate is rendered in headless Chrome and that
 * label is compared against the expected one. The heatmap itself is canvas, and
 * the iframe is cross origin, so the check reads the iframe's own DevTools
 * target rather than the parent DOM.
 *
 * Needs Chrome (`google-chrome`) and network access. Takes several minutes.
 * Run with `make heatmap-validate`, then rerun `make heatmap-sources`.
 */
import { spawn } from "child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const CANDIDATES = join(process.cwd(), "lsts", "heatmap-candidates.json");
const VERIFIED = join(process.cwd(), "lsts", "heatmap-verified.json");

const SHARDS = 4;
const SETTLE_MS = 7000;
const BASE_PORT = 9400;

interface Candidate {
  value: string;
  label: string;
  country: string;
}

interface Result extends Candidate {
  widgetLabel: string;
  ok: boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const normalise = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const page = (source: string) => `<!doctype html>
<meta charset="utf-8">
<body style="margin:0">
<div class="tradingview-widget-container" style="height:100vh">
<script src="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js" async>
{"dataSource":"${source}","blockSize":"market_cap_basic","blockColor":"change","grouping":"no_group",
 "locale":"en","hasTopBar":true,"isDataSetEnabled":true,"width":"100%","height":"100%"}
</script>
</div>`;

let messageId = 0;

const send = (socket: WebSocket, method: string, params?: unknown): Promise<any> =>
  new Promise((resolve, reject) => {
    const id = ++messageId;
    const timer = setTimeout(() => reject(new Error(`${method} timed out`)), 20000);
    const onMessage = (event: MessageEvent) => {
      const message = JSON.parse(String(event.data));
      if (message.id !== id) return;
      clearTimeout(timer);
      socket.removeEventListener("message", onMessage);
      resolve(message.result);
    };
    socket.addEventListener("message", onMessage);
    socket.send(JSON.stringify({ id, method, params }));
  });

const open = async (url: string): Promise<WebSocket> => {
  const socket = new WebSocket(url);
  await new Promise((resolve) => socket.addEventListener("open", resolve));
  return socket;
};

/** Reads the dataset name the widget shows in its top bar. */
const widgetLabel = async (port: number): Promise<string> => {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const frame = targets.find((t: { url?: string }) => (t.url ?? "").includes("tradingview"));
  if (!frame) return "(no widget frame)";
  const socket = await open(frame.webSocketDebuggerUrl);
  await send(socket, "Runtime.enable");
  const result = await send(socket, "Runtime.evaluate", {
    expression: 'document.body ? document.body.innerText.replace(/\\s+/g, " ").trim() : ""',
    returnByValue: true,
  });
  socket.close();
  const text: string = result?.result?.value ?? "";
  return text.split(/ Market cap| Volume| Value traded/)[0].trim() || "(empty)";
};

const runShard = async (index: number, candidates: Candidate[]): Promise<Result[]> => {
  const port = BASE_PORT + index;
  const profile = mkdtempSync(join(tmpdir(), `heatmap-validate-${index}-`));
  const dir = mkdtempSync(join(tmpdir(), `heatmap-pages-${index}-`));
  const chrome = spawn(
    "google-chrome",
    ["--headless=new", "--disable-gpu", "--no-sandbox", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"],
    { stdio: "ignore" },
  );
  await sleep(3000);

  const results: Result[] = [];
  try {
    for (let i = index; i < candidates.length; i += SHARDS) {
      const candidate = candidates[i];
      let label = "(error)";
      try {
        const file = join(dir, `${candidate.value}.html`);
        writeFileSync(file, page(candidate.value));
        const target = await (
          await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`file://${file}`)}`, { method: "PUT" })
        ).json();
        const socket = await open(target.webSocketDebuggerUrl);
        await sleep(SETTLE_MS);
        label = await widgetLabel(port);
        socket.close();
        await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
      } catch (error) {
        label = `(error: ${error instanceof Error ? error.message : error})`;
      }
      const ok = normalise(label) === normalise(candidate.label);
      results.push({ ...candidate, widgetLabel: label, ok });
      console.log(`${ok ? "ok  " : "BAD "} ${candidate.value.padEnd(16)} ${ok ? "" : `expected ${JSON.stringify(candidate.label)}, got ${JSON.stringify(label)}`}`);
    }
  } finally {
    chrome.kill();
  }
  return results;
};

const main = async (): Promise<void> => {
  const candidates: Candidate[] = JSON.parse(readFileSync(CANDIDATES, "utf8"));
  console.log(`validating ${candidates.length} datasets across ${SHARDS} browsers`);

  const results = (await Promise.all([...Array(SHARDS).keys()].map((i) => runShard(i, candidates)))).flat();
  const verified = results.filter((r) => r.ok).map((r) => r.value).sort();

  if (verified.length === 0) {
    console.error("nothing verified, refusing to overwrite the committed list");
    process.exit(1);
  }

  writeFileSync(
    VERIFIED,
    `${JSON.stringify(
      {
        note: "Datasets confirmed to actually load in the TradingView stock heatmap. Regenerate with `make heatmap-validate`.",
        checked: results.length,
        verified: verified.length,
        values: verified,
      },
      null,
      1,
    )}\n`,
  );

  console.log(`\n${results.length} checked, ${verified.length} verified, ${results.length - verified.length} rejected`);
  console.log(`wrote ${VERIFIED}, now rerun \`make heatmap-sources\``);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
