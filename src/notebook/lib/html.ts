import camelCase from "./camelCase";

class Html {
  dom: HTMLElement;

  constructor(dom: HTMLElement) {
    this.dom = dom;
  }

  static fromString(html: string, ownerDocument?: any): Html | null {
    const doc = ownerDocument || document;
    const el = doc.createElement("div");
    try {
      el.innerHTML = html;
    } catch (e) {
      return null;
    }
    const children = el.children;
    const dom = children[0];
    return dom ? new Html(dom) : null;
  }

  get tagName(): string {
    return this.dom.tagName;
  }

  getAttrs(): Record<string, any> {
    const dom = this.dom;
    return dom
      ? dom
          .getAttributeNames()
          .reduce((o: Record<string, any>, name: string) => {
            o[camelCase(name)] = dom.getAttribute(name);
            return o;
          }, {})
      : {};
  }
}

export default Html;
