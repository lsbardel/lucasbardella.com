import config from "../config";
import style from "../lib/style";
import Notebook from "../notebook";

const math = async (require: any) => {
  const katex = await Promise.all([
    style(`${config.KATEX}/dist/katex.min.css`),
    require(`${config.KATEX}/dist/katex.min.js`),
  ]);
  return katex[1];
};

const renderer = {
  code(code: string, info: string) {
    if (info === "math") return `<span class="math">${code}</span>`;
    return false;
  },
  codespan(code: string) {
    if (code.substring(0, 5) === "math:")
      return `<span class="math inline">${code.substring(5)}</span>`;
    return false;
  },
};

const after = async (notebook: Notebook, root: any) => {
  const blocks = root.querySelectorAll("span.math");
  if (blocks.length > 0) {
    if (!notebook.cache.katex)
      notebook.cache.katex = await math(notebook.require);
    const katex = notebook.cache.katex;
    Array.from(blocks, (element: any) => {
      const classes = new Set(element.classList);
      const text = element.innerText;
      const target = document.createElement("div");
      if (classes.has("inline")) katex.render(text, target);
      else katex.render(text, target, { displayMode: true });
      element.parentNode.replaceChild(target.firstChild, element);
    });
  }
};

export default { renderer, after };
