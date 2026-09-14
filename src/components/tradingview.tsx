import * as React from "react";
import { useSiteTheme } from "./site-theme";


interface TradingViewInputBase {
  aspectRatio: string;
  // Follows the site theme when omitted.
  theme?: string;
};

interface TradingViewInput extends TradingViewInputBase {
  symbol: string;
};

interface TradingViewHeatmapInput extends TradingViewInputBase {
  source: string;
  blockSize: string;
  // Legacy boolean toggle, superseded by `grouping` which takes precedence.
  group?: boolean
  grouping?: string;
};

interface TradingViewTicketTapeInput {
  theme?: string;
  logo?: boolean;
  compact?: boolean;
  symbols: string[];
};

export interface MarketOverviewSymbol {
  symbol: string;
  label: string;
};

export interface MarketOverviewTab {
  title: string;
  symbols: MarketOverviewSymbol[];
};

interface TradingViewMarketOverviewInput {
  tabs: MarketOverviewTab[];
  theme?: string;
  aspectRatio: string;
  // One of 1D, 1M, 3M, 12M, 60M, ALL
  dateRange?: string;
  showChart?: boolean;
  logo?: boolean;
};

interface TradingViewMarketDataInput {
  // One group per asset class, same shape as the market overview tabs.
  groups: MarketOverviewTab[];
  theme?: string;
  aspectRatio: string;
  logo?: boolean;
};



export const TradingViewChart = ({symbol, aspectRatio, theme}: TradingViewInput) => {
  const siteTheme = useSiteTheme();
  const colorTheme = theme ?? siteTheme;
  const container = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = container.current;
    if (!el) return;
    // Start from an empty container so a theme change replaces the chart
    // rather than stacking a second one under it.
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    el.replaceChildren(widget);
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
        "theme": "${colorTheme}",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "support_host": "https://www.tradingview.com"
      }`;
    el.appendChild(script);
    return () => el.replaceChildren();
  }, [symbol, colorTheme]);

  const style = {width: "100%", position: "relative" as const, paddingTop: aspectRatio};
  const styleInner = {position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0};
  return (
    <div className="tradingview-widget-container-outer" style={style}>
      <div className="tradingview-widget-container" ref={container} style={styleInner} />
    </div>
  );
};


export const TradingViewHeatmap = ({source, aspectRatio, theme, group, grouping, blockSize}: TradingViewHeatmapInput) => {
  const siteTheme = useSiteTheme();
  const colorTheme = theme ?? siteTheme;
  const container = React.useRef();
  React.useEffect(() => {
    const groupBy = grouping ?? (group ? "sector" : "no_group");
    const el = container.current;
    if (!el) return;
    // The widget script renders into its parent, so drop any previous render
    // before adding a new one, otherwise changing a prop stacks two heatmaps.
    el.replaceChildren();
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "exchanges": [],
        "dataSource": "${source}",
        "grouping": "${groupBy}",
        "blockSize": "${blockSize}",
        "blockColor": "change",
        "locale": "en",
        "symbolUrl": "",
        "colorTheme": "${colorTheme}",
        "hasTopBar": true,
        "isDataSetEnabled": true,
        "isZoomEnabled": true,
        "hasSymbolTooltip": true,
        "isMonoSize": false,
        "width": "100%",
        "height": "100%"
      }`;
    el.appendChild(script);
    return () => el.replaceChildren();
  }, [source, colorTheme, group, grouping, blockSize]);

  const style = {width: "100%", position: "relative", paddingTop: aspectRatio};
  const styleInner = {position: "absolute", top: 0, left: 0, bottom: 0, right: 0};
  return (
    <div className="tradingview-widget-container-outer" style={style}>
      <div className="tradingview-widget-container" ref={container} style={styleInner} />
    </div>
  );
}


export const TradingViewMarketOverview = ({tabs, theme, aspectRatio, dateRange = "12M", showChart = true, logo = true}: TradingViewMarketOverviewInput) => {
  const siteTheme = useSiteTheme();
  const colorTheme = theme ?? siteTheme;
  const container = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = container.current;
    if (!el) return;
    // Same as the heatmap, clear any previous render so prop changes do not stack widgets.
    el.replaceChildren();
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme,
      dateRange,
      showChart,
      locale: "en",
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: logo,
      showFloatingTooltip: true,
      width: "100%",
      height: "100%",
      tabs: tabs.map((tab) => ({
        title: tab.title,
        originalTitle: tab.title,
        symbols: tab.symbols.map((s) => ({s: s.symbol, d: s.label})),
      })),
    });
    el.appendChild(script);
    return () => el.replaceChildren();
  }, [tabs, colorTheme, dateRange, showChart, logo]);

  const style = {width: "100%", position: "relative" as const, paddingTop: aspectRatio};
  const styleInner = {position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0};
  return (
    <div className="tradingview-widget-container-outer" style={style}>
      <div className="tradingview-widget-container" ref={container} style={styleInner} />
    </div>
  );
}


export const TradingViewMarketData = ({groups, theme, aspectRatio, logo = true}: TradingViewMarketDataInput) => {
  const siteTheme = useSiteTheme();
  const colorTheme = theme ?? siteTheme;
  const container = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = container.current;
    if (!el) return;
    // Same as the overview, clear any previous render so prop changes do not stack widgets.
    el.replaceChildren();
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme,
      locale: "en",
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: logo,
      width: "100%",
      height: "100%",
      symbolsGroups: groups.map((group) => ({
        name: group.title,
        originalName: group.title,
        symbols: group.symbols.map((s) => ({name: s.symbol, displayName: s.label})),
      })),
    });
    el.appendChild(script);
    return () => el.replaceChildren();
  }, [groups, colorTheme, logo]);

  const style = {width: "100%", position: "relative" as const, paddingTop: aspectRatio};
  const styleInner = {position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0};
  return (
    <div className="tradingview-widget-container-outer" style={style}>
      <div className="tradingview-widget-container" ref={container} style={styleInner} />
    </div>
  );
}


export const TradingViewTicketTape = ({symbols, compact, logo, theme}: TradingViewTicketTapeInput) => {
  const siteTheme = useSiteTheme();
  const colorTheme = theme ?? siteTheme;
  const container = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = container.current;
    if (!el) return;
    // Same as the chart, replace the previous tape instead of stacking one.
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    el.replaceChildren(widget);
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: symbols.map(s => ({proName: s})),
      showSymbolLogo: logo ? true : false,
      colorTheme,
      isTransparent: false,
      displayMode: compact ? "compact" : "regular",
      locale: "en"
    });
    el.appendChild(script);
    return () => el.replaceChildren();
  }, [symbols, colorTheme, compact, logo]);
  return (
    <div className="tradingview-widget-container" ref={container} />
  );
}
