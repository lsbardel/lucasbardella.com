import notebook from "https://api.observablehq.com/@mbostock/connected-particles-iii.js?v=3";
import {
  Inspector,
  Runtime,
} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";

export default (_, el) => {
  const runtime = new Runtime();
  runtime.module(notebook, Inspector.into(el));
};
