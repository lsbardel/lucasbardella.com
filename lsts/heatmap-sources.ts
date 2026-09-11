/**
 * Regenerates `content/components/heatmap-sources.ts`, the market list used by
 * the market heatmap page.
 *
 * TradingView publishes no API and no documentation for the heatmap dataset
 * list, but the widget ships it in the iframe bundle that renders its own
 * dataset picker. This script reads that bundle and extracts three parallel
 * structures:
 *
 *   1. the `DataSets` enum          -> every valid dataSource identifier
 *   2. a description map            -> SPX500 becomes "S&P 500 Index"
 *   3. a dataset to country map     -> used to group the dropdown
 *
 * Labels for the "All <country>" entries are translation references, resolved
 * against the English locale bundle.
 *
 * Bundle names are content hashed and the minified variable names change on
 * every TradingView deploy, so everything is discovered rather than hardcoded.
 * If the structure changes the script fails loudly and writes nothing, leaving
 * the committed list in place.
 *
 * Run with `make heatmap-sources`.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const EMBED_URL = "https://s.tradingview.com/embed-widget/stock-heatmap/?locale=en";
const OUTPUT = join(process.cwd(), "content", "components", "heatmap-sources.ts");

/** Datasets with no single country, shown together under Europe. */
const EUROPE = new Set(["SX5E", "SXXP", "AllEU"]);

/** Groups listed first, everything else follows alphabetically. */
const PRIORITY = ["United States", "Europe", "United Kingdom"];

/** TradingView uses slugs, these read better in a dropdown. */
const COUNTRY_LABELS: Record<string, string> = {
  america: "United States",
  uk: "United Kingdom",
  ksa: "Saudi Arabia",
  rsa: "South Africa",
  uae: "UAE",
  hongkong: "Hong Kong",
  newzealand: "New Zealand",
  korea: "South Korea",
  srilanka: "Sri Lanka",
  czech: "Czechia",
};

/** Guards against a silently truncated scrape. */
const MIN_SOURCES = 100;

/**
 * The `DataSets` enum is shared across the stock, ETF and crypto heatmaps, and
 * the stock widget silently falls back to S&P 500 for anything it cannot serve,
 * showing the wrong market with no error. Only datasets confirmed to actually
 * load are kept. Refresh that file with the browser validation described in the
 * heatmap-sources skill, then rerun this generator.
 */
const VERIFIED = join(process.cwd(), "lsts", "heatmap-verified.json");

/** Every stock dataset found in the bundle, before verification filtering. */
const CANDIDATES = join(process.cwd(), "lsts", "heatmap-candidates.json");

interface Source {
  value: string;
  label: string;
}

interface Group {
  country: string;
  sources: Source[];
}

const fail = (message: string): never => {
  throw new Error(`${message}\nThe committed list was left untouched.`);
};

const fetchText = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) fail(`GET ${url} returned ${response.status}`);
  return response.text();
};

/** Slice an enum IIFE body, `var x=function(e){return e.A="a",...}({})`. */
const enumBody = (source: string, start: number): string => {
  const end = source.indexOf("}(", start);
  if (end === -1) fail("could not find the end of an enum declaration");
  return source.slice(start, end);
};

const parseEnum = (body: string): Record<string, string> => {
  const values: Record<string, string> = {};
  for (const match of body.matchAll(/e\.([A-Za-z0-9_]+)="([^"]+)"/g)) values[match[1]] = match[2];
  return values;
};

const unquote = (raw: string): string => JSON.parse(`"${raw}"`) as string;

const main = async (): Promise<void> => {
  const embed = await fetchText(EMBED_URL);
  const urls = [...embed.matchAll(/src="([^"]+\.js)"/g)].map((match) => match[1]);
  if (urls.length === 0) fail("no script bundles found on the embed page");

  const bundles = await Promise.all(urls.map(fetchText));

  // The dataset structures all live in whichever bundle declares DataSets.
  const widget = bundles.find((bundle) => /DataSets:\(\)=>/.test(bundle));
  if (!widget) fail("no bundle declares the DataSets enum");

  // 1. dataset identifiers
  const alias = /DataSets:\(\)=>([A-Za-z0-9_$]+)\}/.exec(widget);
  if (!alias) fail("could not resolve the DataSets enum alias");
  // Minified bundles reuse short names, so search forward from the export
  // rather than taking the first declaration that happens to match.
  const declaration = widget.indexOf(`var ${alias[1]}=function(e){return`, alias.index);
  if (declaration === -1) fail("could not locate the DataSets enum body");
  const datasets = Object.values(parseEnum(enumBody(widget, declaration)));
  if (!datasets.includes("SPX500")) fail("the DataSets enum does not contain SPX500, the wrong enum was read");

  // 2. country slugs, found by a member we know exists
  const countryStart = widget.search(/var [A-Za-z0-9_$]+=function\(e\)\{return e\.America="america"/);
  if (countryStart === -1) fail("could not locate the country enum");
  const countries = parseEnum(enumBody(widget, countryStart));

  // 3. dataset to country, the enum aliases are minified so read them generically
  const countryOf: Record<string, string[]> = {};
  for (const match of widget.matchAll(/\[[A-Za-z0-9_$]+\.DataSets\.([A-Za-z0-9_]+)\]:\[([^\]]*)\]/g)) {
    countryOf[match[1]] = [...match[2].matchAll(/[A-Za-z0-9_$]+\.([A-Za-z0-9_]+)/g)]
      .map((member) => countries[member[1]])
      .filter(Boolean);
  }

  // 4. literal labels
  const described: Record<string, string> = {};
  const describedPattern =
    /\[[A-Za-z0-9_$]+\.DataSets\.([A-Za-z0-9_]+)\]:\(\)=>[A-Za-z0-9_$]+\(\{\s*description:\s*"((?:[^"\\]|\\.)*)"/g;
  for (const match of widget.matchAll(describedPattern)) described[match[1]] = unquote(match[2]);

  // 5. translated labels, module ids may be exponent literals such as 381e3
  const translated: Record<string, string> = {};
  const translatedPattern =
    /\[[A-Za-z0-9_$]+\.DataSets\.([A-Za-z0-9_]+)\]:\(\)=>[A-Za-z0-9_$]+\.t\([^)]*?[A-Za-z0-9_$]+\((\d+(?:e\d+)?)\)\)/g;
  for (const match of widget.matchAll(translatedPattern)) translated[match[1]] = String(Number(match[2]));

  // Locale modules may live in any bundle, so merge them all.
  const locale: Record<string, string> = {};
  for (const bundle of bundles) {
    for (const match of bundle.matchAll(/(\d+(?:e\d+)?)\(([A-Za-z0-9_$]+)\)\{\2\.exports=\["((?:[^"\\]|\\.)*)"\]/g)) {
      locale[String(Number(match[1]))] = unquote(match[3]);
    }
  }

  const verified: Set<string> | undefined = existsSync(VERIFIED)
    ? new Set<string>(JSON.parse(readFileSync(VERIFIED, "utf8")).values)
    : undefined;
  if (!verified) fail(`missing ${VERIFIED}, cannot tell supported markets from silently broken ones`);

  const grouped = new Map<string, Source[]>();
  const candidates: { value: string; label: string; country: string }[] = [];
  const unlabelled: string[] = [];
  let rejected = 0;
  for (const value of datasets) {
    if (/Etf$/i.test(value)) continue; // belongs to the ETF heatmap widget

    const slugs = EUROPE.has(value) ? ["europe"] : countryOf[value] ?? [];
    if (slugs.length === 0) continue; // crypto and other non stock datasets
    const label = described[value] ?? locale[translated[value]];
    if (!label) {
      unlabelled.push(value);
      continue;
    }
    const slug = slugs[0];
    const country = slug === "europe" ? "Europe" : COUNTRY_LABELS[slug] ?? slug[0].toUpperCase() + slug.slice(1);
    // Recorded before filtering, so the validator can retest everything the
    // bundle offers and markets can be restored if TradingView starts serving them.
    candidates.push({ value, label, country });
    if (!verified.has(value)) {
      rejected += 1;
      continue;
    }
    if (!grouped.has(country)) grouped.set(country, []);
    grouped.get(country)!.push({ value, label });
  }

  if (unlabelled.length > 0) fail(`no label resolved for: ${unlabelled.join(", ")}`);
  const total = [...grouped.values()].reduce((sum, sources) => sum + sources.length, 0);
  if (total < MIN_SOURCES) fail(`only ${total} markets extracted, expected at least ${MIN_SOURCES}`);
  if (!grouped.has("United States")) fail("no United States group, the country map looks wrong");

  const names = [...grouped.keys()].sort((a, b) => a.localeCompare(b));
  const ordered = [...PRIORITY.filter((c) => grouped.has(c)), ...names.filter((c) => !PRIORITY.includes(c))];
  const groups: Group[] = ordered.map((country) => ({ country, sources: grouped.get(country)! }));

  const previous = existsSync(OUTPUT) ? readFileSync(OUTPUT, "utf8") : "";
  const before = new Set([...previous.matchAll(/\{ value: "([^"]+)"/g)].map((match) => match[1]));
  const after = new Set(groups.flatMap((group) => group.sources.map((source) => source.value)));

  writeFileSync(OUTPUT, render(groups, total));
  writeFileSync(CANDIDATES, `${JSON.stringify(candidates, null, 1)}\n`);

  const added = [...after].filter((value) => !before.has(value));
  const removed = [...before].filter((value) => !after.has(value));
  console.log(`wrote ${OUTPUT}`);
  console.log(`${total} markets across ${groups.length} groups`);
  console.log(`${rejected} datasets skipped as unverified`);
  if (before.size === 0) console.log("no previous list to compare against");
  else if (added.length === 0 && removed.length === 0) console.log("no change");
  else {
    if (added.length > 0) console.log(`added: ${added.join(", ")}`);
    if (removed.length > 0) console.log(`removed: ${removed.join(", ")}`);
  }
};

const render = (groups: Group[], total: number): string => {
  const lines = [
    "// Generated by lsts/heatmap-sources.ts, run `make heatmap-sources` to refresh.",
    "// Extracted from the TradingView stock heatmap widget bundle, which ships the",
    "// DataSets enum, a description map and a dataset/country map. There is no",
    "// public API for this list. Do not edit by hand.",
    `// ${total} markets across ${groups.length} groups.`,
    "",
    "export interface HeatmapSource {",
    "  value: string;",
    "  label: string;",
    "}",
    "",
    "export interface HeatmapSourceGroup {",
    "  country: string;",
    "  sources: HeatmapSource[];",
    "}",
    "",
    "export const SOURCE_GROUPS: HeatmapSourceGroup[] = [",
  ];
  for (const group of groups) {
    lines.push("  {");
    lines.push(`    country: ${JSON.stringify(group.country)},`);
    lines.push("    sources: [");
    for (const source of group.sources) {
      lines.push(`      { value: ${JSON.stringify(source.value)}, label: ${JSON.stringify(source.label)} },`);
    }
    lines.push("    ],");
    lines.push("  },");
  }
  lines.push("];");
  lines.push("");
  lines.push("/** Flat lookup used to validate a source coming from the query string. */");
  lines.push("export const SOURCE_VALUES = new Set<string>(");
  lines.push("  SOURCE_GROUPS.flatMap((group) => group.sources.map((source) => source.value)),");
  lines.push(");");
  lines.push("");
  return lines.join("\n");
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
