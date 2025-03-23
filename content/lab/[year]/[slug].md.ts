import { parseArgs } from "util";
import ContentLoader from "../../../src/content.js";

const {
  values: {slug, year}
} = parseArgs({
  options: {slug: {type: "string"}, year: {type: "string"}}
});

const entry = await ContentLoader.loadPage("lab", slug);
if (entry) {
  process.stdout.write(entry.body);
}
