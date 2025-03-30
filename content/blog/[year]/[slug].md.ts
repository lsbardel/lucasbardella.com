import { parseArgs } from "util";
import { emitContent } from "../../../lsts/content";

const {
  values: { slug, year },
} = parseArgs({
  options: { slug: { type: "string" }, year: { type: "string" } },
});

await emitContent("blog", slug);
