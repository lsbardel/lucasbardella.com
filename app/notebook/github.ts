import { Html, Markdown, renderCode } from "@metablock/notebook";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit();

const className = "github-content";

const renderer = {
  html(raw: string) {
    const dom = Html.fromString(raw);
    if (dom && dom.tagName === "GITHUB") {
      const attrs = dom.getAttrs();
      const data = Object.keys(attrs).reduce((d: string, key: string) => {
        return `${d} data-${key}="${attrs[key]}"`;
      }, "");
      return `<div class="${className}"${data}></div>`;
    }
    return false;
  },
};

// Executed once the root element is mounted in the DOM
const after = async (mkd: Markdown, root: any) => {
  const modules = root.querySelectorAll(`div.${className}`);
  if (modules.length === 0) return;
  return Promise.all(
    Array.from(modules, async (element: any) => {
      const result = await octokit.repos.getContent({
        owner: element.dataset.owner,
        repo: element.dataset.repo,
        path: element.dataset.path,
      });
      const data: any = result.data;
      if (result.status == 200 && data.type === "file") {
        element.innerHTML = "<pre><code></code></pre>";
        const code = element.querySelector("code");
        const text = atob(data.content);
        code.innerHTML = text;
        await renderCode(mkd, code, text, element.dataset.lang);
      }
    })
  );
};

export default { renderer, after };
