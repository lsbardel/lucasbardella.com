import {build} from "esbuild";
import {glob} from "glob";

await build({
  entryPoints: await glob("./src/*"),
  bundle: true,
  outdir: "content/components",
  sourcemap: "linked",
  format: "esm",
  logLevel: "info",
  external: [
    "npm:@observablehq/plot",
    "npm:d3",
    "npm:react"
  ],
});
