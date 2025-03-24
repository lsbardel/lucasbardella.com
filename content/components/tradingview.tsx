import * as React from "npm:react";


type TradingViewInput = {
  symbol: string;
  aspectRatio: string;
  theme: string;
};


export const TradingViewChart = ({symbol, aspectRatio, theme}: TradingViewInput) => {
  const setRef = (el) => {
    if (!el) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "${theme}",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "support_host": "https://www.tradingview.com"
      }`;
    el.appendChild(script);
  };

  const style = {width: "100%", position: "relative", paddingTop: aspectRatio};
  const styleInner = {position: "absolute", top: 0, left: 0, bottom: 0, right: 0};
  return (
    <div className="tradingview-widget-container-outer" style={style}>
      <div className="tradingview-widget-container" ref={setRef} style={styleInner}>
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
};
