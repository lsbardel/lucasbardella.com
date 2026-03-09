import * as React from "npm:react";

const TRADING_VIEW_BASE = "https://assets.metablock.io/trading-view/charting_library/";
const TRADING_VIEW_URL = `${TRADING_VIEW_BASE}charting_library.js`;

// This tells TypeScript that the TradingView object will be available globally
// from the script tag you included in your main HTML file.
declare const TradingView: any;

// TradingView chart styles: 0=Bars, 1=Candles, 2=Line, 3=Area, 9=Line Break, 12=HLC Area
type ChartStyle = 0 | 1 | 2 | 3 | 9 | 12;

export interface SymbolDef {
  symbol: string;
  description: string;
  type: string;
}

interface TradingViewChartProps {
  data: any[];
  symbols: SymbolDef[];
  chartStyle?: ChartStyle;
}

/**
 * A React component to display time-series data (like BOE rates)
 * using the TradingView Charting Library.
 */
export const TradingViewChart: React.FC<TradingViewChartProps> = ({ data, symbols, chartStyle = 2 }) => {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const widgetRef = React.useRef<any>(null);
  const [isScriptReady, setIsScriptReady] = React.useState(false);

  // Load TradingView script
  React.useEffect(() => {
    if (document.querySelector(`script[src="${TRADING_VIEW_URL}"]`)) {
      setIsScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = TRADING_VIEW_URL;
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => setIsScriptReady(true);
    script.onerror = () => console.error("Failed to load TradingView charting library.");
    document.body.appendChild(script);
  }, []);

  // Custom datafeed for multiple series
  const multiSeriesDatafeed = React.useMemo(() => {
    const symbolMap = Object.fromEntries(symbols.map(s => [s.symbol, s]));
    const seriesData = transformData(data, symbols.map(s => s.symbol));
    return {
      onReady: (cb: any) => {
        setTimeout(() => cb({ supported_resolutions: ["1D"] }), 0);
      },
      searchSymbols: (userInput: string, _exchange: string, _symbolType: string, onResult: any) => {
        const query = userInput.toLowerCase();
        const results = symbols
          .filter(s => s.symbol.toLowerCase().includes(query) || s.description.toLowerCase().includes(query))
          .map(s => ({ symbol: s.symbol, description: s.description, exchange: "", ticker: s.symbol, type: s.type }));
        onResult(results);
      },
      resolveSymbol: (symbol: string, onSymbolResolvedCallback: any) => {
        const def = symbolMap[symbol];
        setTimeout(() => {
          onSymbolResolvedCallback({
            name: symbol,
            ticker: symbol,
            description: def?.description ?? symbol,
            type: def?.type ?? symbol,
            session: "24x7",
            timezone: "Etc/UTC",
            minmov: 1,
            pricescale: 10000,
            has_intraday: false,
            has_no_volume: true,
            supported_resolutions: ["1D"],
            data_status: "streaming",
          });
        }, 0);
      },
      getBars: (symbolInfo: any, resolution: string, periodParams: any, onResult: any, onError: any) => {
        const { from, to } = periodParams;
        const allBars = (seriesData[symbolInfo.name] || []).map((row: any) => ({
          time: new Date(row.date).getTime(),
          close: row.value,
          open: row.value,
          high: row.value,
          low: row.value,
          volume: 0,
        }));
        const bars = allBars.filter((b: any) => b.time >= from * 1000 && b.time < to * 1000);
        onResult(bars, { noData: bars.length === 0 });
      },
      subscribeBars: () => {},
      unsubscribeBars: () => {},
    };
  }, [data, symbols]);

  // Initialize TradingView widget
  React.useEffect(() => {
    if (!isScriptReady || !chartContainerRef.current) return;

    if (widgetRef.current) {
      widgetRef.current.remove();
      widgetRef.current = null;
    }

    const mainSymbol = symbols[0]?.symbol;
    if (!mainSymbol) return;
    widgetRef.current = new TradingView.widget({
      symbol: mainSymbol,
      datafeed: multiSeriesDatafeed,
      interval: "1D",
      container: chartContainerRef.current,
      library_path: TRADING_VIEW_BASE,
      locale: "en",
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: "https://saveload.tradingview.com",
      charts_storage_api_version: "1.1",
      client_id: "tradingview.com",
      user_id: "public_user_id",
      fullscreen: false,
      autosize: true,
      theme: "dark",
      overrides: {
        "mainSeriesProperties.style": chartStyle,
      },
      studies_overrides: {},
      onChartReady: function() {
        if (symbols.length > 1 && widgetRef.current) {
          const chart = widgetRef.current.activeChart();
          for (let i = 1; i < symbols.length; ++i) {
            chart.createStudy('Compare', false, false, { symbol: symbols[i].symbol });
          }
        }
      }
    });
  }, [isScriptReady, multiSeriesDatafeed, symbols]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "500px" }} />;
};


const transformData = (data: Record<string, any>[], symbols: string[]): Record<string, any[]> => {
  const result: Record<string, any[]> = {};
  for (const symbol of symbols) {
    result[symbol] = data
      .filter(row => row[symbol] !== undefined && row[symbol] !== null)
      .map(row => ({ date: row.date, value: row[symbol] }));
  }
  return result;
}
