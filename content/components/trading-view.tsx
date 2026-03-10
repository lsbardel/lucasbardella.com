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
  displaySymbols?: SymbolDef[];
  colors?: string[];
  chartStyle?: ChartStyle;
  aspectRatio?: number;
  visibleBars?: number;
}

/**
 * A React component to display time-series data (like BOE rates)
 * using the TradingView Charting Library.
 */
export const TradingViewChart: React.FC<TradingViewChartProps> = ({ data, symbols, displaySymbols, colors = [], chartStyle = 2, aspectRatio = 16 / 9, visibleBars }) => {
  const plotSymbols = displaySymbols ?? symbols;
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const widgetRef = React.useRef<any>(null);
  const allBarsRef = React.useRef<Record<string, { time: number }[]>>({});
  const [isScriptReady, setIsScriptReady] = React.useState(false);

  // Load TradingView script
  React.useEffect(() => {
    if (typeof TradingView !== "undefined") {
      setIsScriptReady(true);
      return;
    }
    const existing = document.querySelector(`script[src="${TRADING_VIEW_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => setIsScriptReady(true));
      return;
    }
    const script = document.createElement("script");
    script.src = TRADING_VIEW_URL;
    script.async = true;
    script.onload = () => setIsScriptReady(true);
    script.onerror = () => console.error("Failed to load TradingView charting library.");
    document.body.appendChild(script);
  }, []);

  // Custom datafeed for multiple series
  const multiSeriesDatafeed = React.useMemo(() => {
    const symbolMap = Object.fromEntries(symbols.map(s => [s.symbol, s]));
    const seriesData = transformData(data, symbols.map(s => s.symbol));

    // Pre-compute bars for all symbols so getBars doesn't recompute on every call
    const allBarsMap: Record<string, { time: number; open: number; high: number; low: number; close: number; volume: number }[]> = {};
    for (const symbol of symbols.map(s => s.symbol)) {
      allBarsMap[symbol] = (seriesData[symbol] || []).map((row: any) => ({
        time: new Date(row.date).getTime(),
        close: row.value,
        open: row.value,
        high: row.value,
        low: row.value,
        volume: 0,
      }));
    }
    allBarsRef.current = allBarsMap;

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
      getBars: (symbolInfo: any, _resolution: string, periodParams: any, onResult: any, _onError: any) => {
        const { from, to } = periodParams;
        const allBars = allBarsMap[symbolInfo.name] || [];
        const bars = allBars.filter((b) => b.time >= from * 1000 && b.time < to * 1000);
        // Only signal noData when from is at or before the earliest bar — prevents TV from
        // stopping historical data requests just because a range has no bars (e.g. weekends).
        const firstBarTime = allBars.length > 0 ? allBars[0].time : Infinity;
        onResult(bars, { noData: from * 1000 <= firstBarTime });
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

    const mainSymbol = plotSymbols[0]?.symbol;
    if (!mainSymbol) return;

    let timeframe: { from: number; to: number } | undefined;
    if (visibleBars) {
      const bars = allBarsRef.current[mainSymbol] ?? [];
      if (bars.length >= visibleBars) {
        timeframe = {
          from: bars[bars.length - visibleBars].time / 1000,
          to: bars[bars.length - 1].time / 1000,
        };
      }
    }

    widgetRef.current = new TradingView.widget({
      symbol: mainSymbol,
      ...(timeframe ? { timeframe } : {}),
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
        ...(colors[0] ? { "mainSeriesProperties.lineStyle.color": colors[0] } : {}),
      },
      studies_overrides: {},
    });
    widgetRef.current.onChartReady(() => {
      const chart = widgetRef.current.activeChart();
      const studyPromises = plotSymbols.slice(1).map((s, i) =>
        chart.createStudy('Compare', false, false, { symbol: s.symbol, source: 'close' }, colors[i + 1] ? { "plot.color": colors[i + 1] } : undefined)
      );
      Promise.all(studyPromises).then(() => {
        chart.getPanes()[0].getRightPriceScales()[0].setMode(0); // 0 = Normal (absolute values, no percentage)
      });
    });
  }, [isScriptReady, multiSeriesDatafeed, plotSymbols]);

  return (
    <div style={{ width: "100%", position: "relative", paddingTop: `${(1 / aspectRatio) * 100}%` }}>
      <div ref={chartContainerRef} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
    </div>
  );
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
