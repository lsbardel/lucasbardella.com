import { Html, loadJs, Markdown } from "@metablock/notebook";
import { isSsr } from "@metablock/react";

const className = "tradingview-widget-container";
let id_counter = 0;

const renderer = {
  html(raw: string) {
    const dom = Html.fromString(raw);
    if (dom && dom.tagName === "TRADINGVIEW") {
      id_counter++;
      const id = `tradingview-${id_counter}`;
      const attrs = dom.getAttrs();
      const ar = attrs.aspectratio;
      const data = Object.keys(attrs).reduce((d: string, key: string) => {
        return `${d} data-${key}="${attrs[key]}"`;
      }, "");
      if (ar)
        return `<div class="tradingview-outer" style="width: 100%; position: relative; padding-top:${ar}">
            <div id=${id} class="${className}" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0"${data}></div>
          </div>`;
      else return `<div id=${id} class="${className}"${data}></div>`;
    }
    return false;
  },
};

// Executed once the root element is mounted in the DOM
const after = async (mkd: Markdown, root: any) => {
  if (isSsr()) return;
  const modules = root.querySelectorAll(`div.${className}`);
  if (modules.length === 0) return;
  await loadJs("https://s3.tradingview.com/tv.js");
  modules.forEach((element: any) => {
    renderTradingView(element);
  });
};

const renderTradingView = (element: HTMLElement) => {
  const dom = new Html(element);
  const attrs = dom.getAttrs();
  const theme = element.dataset.theme || "dark";

  // @ts-ignore
  const TradingView = window.TradingView;
  new TradingView.widget({
    autosize: true,
    symbol: element.dataset.symbol,
    interval: "D",
    timezone: "Etc/UTC",
    theme,
    style: "1",
    locale: "en",
    toolbar_bg: "#f1f3f6",
    enable_publishing: false,
    allow_symbol_change: true,
    container_id: attrs.id,
  });
};

export default { renderer, after };
