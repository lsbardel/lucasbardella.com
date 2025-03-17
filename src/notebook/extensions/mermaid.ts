import config from "../config";
import Notebook from "../notebook";

const renderer = {
  code(code: string, info: string) {
    if (info === "mermaid") return `<div class="mermaid">${code}</div>`;
    return false;
  },
};

const after = async (notebook: Notebook, root: any) => {
  const nodes = root.querySelectorAll("div.mermaid");
  if (nodes.length > 0) {
    nodes.forEach((n: any) => {
      n.style.justifyContent = "center";
      n.style.display = "flex";
    });
    const theme = notebook.options.mermaidTheme || notebook.options.mode === "dark" ? "dark" : "neutral";
    const mer = await notebook.importModule(config.MERMAID);
    mer.default.initialize({ securityLevel: "loose", theme });
    await mer.default.run({ nodes });
  }
};

export default { renderer, after };
