/**
 * Runs the data loaders and writes their output where the site reads it.
 *
 * Observable Framework ran a loader whenever a page asked for the file it
 * produced, and cached the result under content/.observablehq/cache. Astro has
 * no such mechanism, so this script takes its place: `make data` regenerates
 * everything, and CI runs it before the build, exactly as the deploy has always
 * worked. Nothing it writes is committed.
 *
 * A loader prints its output to stdout. Most write one file; the `.zip.py`
 * loaders write an archive, which is either extracted into a directory or kept
 * as a zip, depending on how the page reads it.
 *
 * By default a loader whose output already exists is skipped, which is what
 * makes a local build cheap and keeps API calls down. Pass --force to refresh.
 */
import { spawnSync } from "child_process";
import { unzipSync } from "fflate";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";

interface Loader {
  /** Path of the loader, relative to dataloaders/. */
  source: string;
  /** Where its output goes, relative to the repository root. */
  out: string;
  /** Unpack the archive into `out` instead of writing it as a single file. */
  extract?: boolean;
}

/**
 * Only loaders the site actually reads are listed. Observable ran loaders on
 * demand, so an unreferenced one never ran: dataloaders/cutting-through-noise.zip.py
 * is the current example, its coding entry is a draft that shows the snippet
 * rather than plotting anything.
 *
 * The three JSON files under src/data are imported at build time, by the
 * credits page, the AI downloads post and the Rust posts, so they are inputs to
 * the bundle rather than files fetched at runtime.
 */
const LOADERS: Loader[] = [
  { source: "boe.csv.py", out: "public/data/boe.csv" },
  { source: "country-stats.csv.py", out: "public/data/country-stats.csv" },
  { source: "world-110m.json.js", out: "public/data/world-110m.json" },
  { source: "eurostat/catalogue.csv.js", out: "public/data/eurostat/catalogue.csv" },
  { source: "google-analytics/channel.csv.ts", out: "public/data/google-analytics/channel.csv" },
  { source: "google-analytics/summary.csv.ts", out: "public/data/google-analytics/summary.csv" },
  { source: "images.json.py", out: "src/data/images.json" },
  { source: "repos.json.ts", out: "src/data/repos.json" },
  { source: "the-most-used-ais.json.py", out: "src/data/the-most-used-ais.json" },
  { source: "fed.zip.py", out: "public/data/fed", extract: true },
  { source: "wholesale.zip.py", out: "public/data/wholesale", extract: true },
  { source: "options.zip.py", out: "public/data/options", extract: true },
  // The CFD pages fetch the archive itself and unzip it in the browser, so
  // these two stay zipped. They come from `make cfd-cases`, which runs the
  // OpenFOAM simulations in Docker and writes cfd/cases/<case>_results.zip.
  { source: "cfd/cavity_100.zip.py", out: "public/data/cfd/cavity_100.zip" },
  { source: "cfd/cavity_1000.zip.py", out: "public/data/cfd/cavity_1000.zip" },
];

const force = process.argv.includes("--force");

/**
 * Python loaders need the project virtualenv, which is what `uv run` gives them.
 *
 * The cfd extra is requested because the two CFD loaders import cfd.cavity, which
 * imports foamlib at module level. They only read a zip that `make cfd-cases`
 * already wrote, so nothing here talks to OpenFOAM, but the import still has to
 * resolve. Without the extra a clean checkout fails on ModuleNotFoundError, which
 * is invisible locally because the zip is usually already on disk and skipped.
 */
const command = (source: string): [string, string[]] => {
  if (source.endsWith(".py"))
    return ["uv", ["run", "--extra", "cfd", "python", join("dataloaders", source)]];
  if (source.endsWith(".ts")) return ["npx", ["tsx", join("dataloaders", source)]];
  return ["node", [join("dataloaders", source)]];
};

let written = 0;
let skipped = 0;

for (const { source, out, extract } of LOADERS) {
  if (!force && existsSync(out)) {
    skipped++;
    continue;
  }

  const [bin, args] = command(source);
  const result = spawnSync(bin, args, { maxBuffer: 512 * 1024 * 1024 });
  if (result.status !== 0) {
    process.stderr.write(result.stderr?.toString() ?? "");
    throw new Error(`${source} failed with status ${result.status}`);
  }
  if (!result.stdout?.length) throw new Error(`${source} produced no output`);

  if (extract) {
    const files = unzipSync(new Uint8Array(result.stdout));
    mkdirSync(out, { recursive: true });
    for (const [name, bytes] of Object.entries(files)) {
      if (name.endsWith("/")) continue;
      const target = join(out, name);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, bytes);
    }
    console.log(`${source} -> ${out}/ (${Object.keys(files).length} files)`);
  } else {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, result.stdout);
    console.log(`${source} -> ${out} (${result.stdout.length} bytes)`);
  }
  written++;
}

console.log(`${written} written, ${skipped} already present${force ? "" : ", pass --force to refresh"}`);
