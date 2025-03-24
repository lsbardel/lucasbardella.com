import * as React from "npm:react";


interface TradingViewInputBase {
  aspectRatio: string;
  theme: string;
};

interface TradingViewInput extends TradingViewInputBase {
  symbol: string;
};

interface TradingViewHeatmapInput extends TradingViewInputBase {
  source: string;
  blockSize: string;
  group?: boolean
};

interface TradingViewTicketTapeInput {
  theme: string;
  logo?: boolean;
  compact?: boolean;
  symbols: string[];
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


export const TradingViewHeatmap = ({source, aspectRatio, theme, group, blockSize}: TradingViewHeatmapInput) => {
  const container = React.useRef();
  React.useEffect(() => {
    const grouping = group ? "sector" : "no_group";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "exchanges": [],
        "dataSource": "${source}",
        "grouping": "${grouping}",
        "blockSize": "${blockSize}",
        "blockColor": "change",
        "locale": "en",
        "symbolUrl": "",
        "colorTheme": "${theme}",
        "hasTopBar": true,
        "isDataSetEnabled": true,
        "isZoomEnabled": true,
        "hasSymbolTooltip": true,
        "isMonoSize": false,
        "width": "100%",
        "height": "100%"
      }`;
    container.current.appendChild(script);
  }, [source, theme, group, blockSize]);

  const style = {width: "100%", position: "relative", paddingTop: aspectRatio};
  const styleInner = {position: "absolute", top: 0, left: 0, bottom: 0, right: 0};
  return (
    <div className="tradingview-widget-container-outer" style={style}>
      <div className="tradingview-widget-container" ref={container} style={styleInner}>
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
}


export const TradingViewTicketTape = ({symbols, compact, logo, theme}: TradingViewTicketTapeInput) => {
  const container = React.useRef();
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: symbols.map(s => ({proName: s})),
      showSymbolLogo: logo ? true : false,
      colorTheme: theme,
      isTransparent: false,
      displayMode: compact ? "compact" : "regular",
      locale: "en"
    });
    container.current.appendChild(script);
  }, [symbols, theme, compact, logo]);
  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}
