import attachScript from "../lib/attachScript";
import Html from "../lib/html";
import Notebook from "../notebook";


const renderer = {
  html(raw: string) {
    const html = Html.fromString(raw);
    if (html && html.tagName === "SCRIPT") {
      const attrs = html.getAttrs();
      if (attrs.showCode !== undefined) {
        const div = document.createElement("div");
        div.innerHTML = `<pre><code class="html"></code></pre>${raw}`;
        const code = div.querySelector("code") as HTMLElement;
        code.textContent = raw;
        return div.innerHTML;
      }
    }
    return false;
  },
};


const after = async (
  notebook: Notebook,
  root: any,
  options: any
): Promise<void> => {
  const elements = root.querySelectorAll("script");
  if (elements.length > 0) {
    await Promise.all(
      Array.from(elements, (element: HTMLElement) => {
        const html = new Html(element);
        const attrs = html.getAttrs();
        const src = attrs.src;
        element.remove();
        if (src) {
          delete attrs.src;
          return notebook.loadJs(src, attrs);
        } else {
          return attachScript(element);
        }
      }).filter((p: any) => p)
    );
  }
};

export default { after, renderer };
