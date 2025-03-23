import { parseArgs } from "util";
import { emitContent } from "../../../src/content";

const {
  values: {slug, year}
} = parseArgs({
  options: {slug: {type: "string"}, year: {type: "string"}}
});

await emitContent("blog", slug);
