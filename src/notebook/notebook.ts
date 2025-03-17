import { require as requireDefault, requireFrom, resolver } from "d3-require";
import config from "./config";
import code from "./extensions/code";
import math from "./extensions/math";
import mermaid from "./extensions/mermaid";
import script from "./extensions/script";
import addStyle from "./lib/addStyle";
import loadJs from "./lib/loadJs";
import loadJsModule from "./lib/loadJsModule";
import style from "./lib/style";
import { asArray } from "./lib/utils";
import Markdown, { defaultMarkdownExtensions } from "./markdown";

defaultMarkdownExtensions.push(math);
defaultMarkdownExtensions.push(mermaid);
defaultMarkdownExtensions.push(code);
defaultMarkdownExtensions.push(script);

const notebookResolver = (notebook: Notebook, resolve?: resolver) => {
  const defaultResolve = resolve || requireDefault.resolve;
  return async (name: string): Promise<string> => {
    for (let i = 0; i < notebook.resolvers.length; ++i) {
      const resolved = notebook.resolvers[i](name);
      if (resolved) return resolved;
    }
    return await defaultResolve(name);
  };
};

class Notebook {
  require: any;
  cache: Record<string, any>;
  models: Record<string, any>;
  actions: Record<string, any>;
  options: Record<string, any>;
  defaultResolve: any;
  resolvers: any[];
  md: Markdown;

  constructor(resolve?: resolver) {
    this.require = requireFrom(notebookResolver(this, resolve));
    this.cache = {};
    this.models = {};
    this.actions = {};
    this.resolvers = [];
    this.options = {
      mode: "light",
      highlightStyle: "",
      codeClipboard: true,
      mermaidTheme: "",
    };
    this.md = new Markdown(this);
  }

  static installed(): Notebook {
    // @ts-ignore
    return window.notebook as Notebook;
  }

  get resolve(): resolver {
    return this.require.resolve;
  }

  async loadStyle(stylesheet: string): Promise<void> {
    if (!this.cache[stylesheet]) {
      await style(stylesheet);
      this.cache[stylesheet] = true;
    }
  }

  // load a javascript file
  async loadJs(src: string, attrs?: Record<string, any>): Promise<void> {
    await loadJs({...attrs, src});
  }

  // import a javascript module
  async importModule(src: string): Promise<any> {
    return await loadJsModule(src);
  }

  addStyle(style: string) {
    addStyle(style);
  }

  // Execute Javascript code by creating a new script element
  exec(code: string, element?: Element) {
    const script = document.createElement("script");
    const wrappedCode = `(function() {\n${code}\n}());`;
    const body = document.createTextNode(wrappedCode);
    script.appendChild(body);
    const target = element || document.body;
    target.appendChild(script);
  }

  // Render a markdown text into an element
  async render(text: string, element: any, options?: any): Promise<any> {
    const opts = options || {};
    const promises: Promise<any>[] = [];
    if (opts.stylesheet)
      asArray(opts.stylesheet).forEach((stylesheet: string) => {
        promises.push(this.loadStyle(stylesheet));
      });
    if (opts.js)
      asArray(opts.js).forEach((js: string) => {
        promises.push(this.loadJs(js));
      });
    if (promises.length) await Promise.all(promises);
    return await this.md.render(text, element, opts);
  }

  async renderCode(
    element: any,
    code?: string,
    lang?: string
  ): Promise<Record<string, any>> {
    const mode: string = this.options.mode || "light";
    const hls =
      this.options.highlightStyle || config.defaultHighlightStyle[mode];
    await this.loadStyle(`${config.HL_CSS}/${hls}.min.css`);
    await this.loadJs(`${config.HL_ROOT}/highlight.min.js`);
    const text = code || element.innerText;
    // @ts-ignore
    const hl = window.hljs;
    const classes = new Set(element.classList.values());
    const language = lang || element.className || "plaintext";
    let languageObject = hl.getLanguage(language);
    if (!languageObject) {
      languageObject = await this.require(
        `${config.HL_ROOT}/languages/${language}.min.js`
      );
      hl.registerLanguage(language, languageObject);
    }
    element.innerHTML = hl.highlight(text, { language }).value;
    if (this.options.codeClipboard) {
      const pre = element.parentElement;
      if (pre && pre.tagName === "PRE") {
        const clipboard = document.createElement("with-clipboard");
        clipboard.innerHTML = pre.outerHTML;
        pre.replaceWith(clipboard);
      }
    }
    const langu =
      languageObject && languageObject.aliases ? languageObject.aliases[0] : "";
    return { lang: langu, code: text, element, classes };
  }

  context2d(
    width: number,
    height: number,
    dpi?: number
  ): CanvasRenderingContext2D {
    if (!dpi) dpi = devicePixelRatio;
    const canvas = document.createElement("canvas");
    canvas.width = width * dpi;
    canvas.height = height * dpi;
    canvas.style.width = width + "px";
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.scale(dpi, dpi);
    return context;
  }
}

export default Notebook;
