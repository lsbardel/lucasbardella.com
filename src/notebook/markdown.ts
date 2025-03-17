import config from "./config";
import Notebook from "./notebook";

export const defaultMarkdownExtensions: any[] = [];

class Markdown {
  notebook: Notebook;
  extensions: any[];
  theme = "";
  _marked: any;

  constructor(notebook: Notebook) {
    this.notebook = notebook;
    this.extensions = defaultMarkdownExtensions.slice();
    this._marked = null;
  }

  get cache(): any {
    return this.notebook.cache;
  }

  get require(): any {
    return this.notebook.require;
  }

  async getMarked() {
    if (!this._marked) {
      this._marked = await this.require(config.MARKED);
      const renderer = multi(
        this.extensions.filter((e) => e.renderer).map((e) => e.renderer)
      );
      const tokenizer = multi(
        this.extensions.filter((e) => e.tokenizer).map((e) => e.tokenizer)
      );
      this._marked.setOptions({
        async: true,
        langPrefix: 'hljs language-',
        gfm: true,
      });
      this._marked.use({ tokenizer, renderer });
    }
    return this._marked;
  }

  async render(text: string, element: any, options?: any): Promise<any> {
    const opts = options || {};
    const markdown = await this.getMarked();
    const root = element || document.createElement("div");
    const el = markdown.parse(text, { langPrefix: "" }).trim();
    root.innerHTML = el;
    await Promise.all(
      this.extensions.map((e) => (e.after ? e.after(this.notebook, root, opts) : null))
    );
  }

}

const multi = (handlers: any[]) => {
  const ext: Record<string, any> = {};
  handlers.forEach((handler) => {
    Object.keys(handler).forEach((key: string) => {
      if (!(key in ext)) ext[key] = [handler[key]];
      else ext[key].push(handler[key]);
    });
  });
  Object.keys(ext).forEach((key) => {
    ext[key] = multiExec(ext[key]);
  });
  return ext;
};

const multiExec = (handlers: any[]) => {
  return (...args: any[]) => {
    let result;
    for (let i = 0; i < handlers.length; ++i) {
      result = handlers[i](...args);
      if (result !== false) return result;
    }
    return false;
  };
};

export default Markdown;
