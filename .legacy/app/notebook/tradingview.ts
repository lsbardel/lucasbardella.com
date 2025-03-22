import { createNotebook } from "@metablock/notebook";

let id_counter = 0;

class TradingView extends HTMLElement {
  async connectedCallback() {
    const notebook = createNotebook();
    await notebook.loadJs("https://s3.tradingview.com/tv.js");
    const root = this.shadowRoot || this;
    const symbol = this.getAttribute("symbol");
    if (!symbol) {
      root.innerHTML = `<div style="color: red">No symbol attribute</div>`;
      return;
    }
    id_counter++;
    const id = `tw${id_counter}`;
    const ar = this.getAttribute("aspectratio");
    root.innerHTML = ar
      ? `<div class="module-outer" style="width: 100%; position: relative; padding-top:${ar}">
        <div id="${id}" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0"></div>
      </div>`
      : `<div id="${id}"></div>`;
    const theme_ = this.getAttribute("theme");
    const theme =
      !theme_ || theme_ === "auto" ? notebook.options.mode || "light" : theme_ || "light";

    // @ts-ignore
    const TradingView = window.TradingView;
    new TradingView.widget({
      autosize: true,
      symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      toolbar_bg: "#f1f3f6",
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: id,
    });
  }
}

customElements.define("trading-view", TradingView);
