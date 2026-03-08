import * as React from "npm:react";

const TRADING_VIEW_URL = "https://assets.metablock.io/trading-view/charting_library/charting_library.js";

// This tells TypeScript that the TradingView object will be available globally
// from the script tag you included in your main HTML file.
declare const TradingView: any;

interface TradingViewChartProps {
  // The CSV data
  data: any[];
  // The symbol name to display on the chart
  symbols: string[];
}

/**
 * A React component to display time-series data (like BOE rates)
 * using the TradingView Charting Library.
 */
export const TradingViewChart: React.FC<TradingViewChartProps> = ({ data, symbols }) => {
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
    const seriesData = transformData(data, symbols);
    return {
      onReady: (cb: any) => {
        setTimeout(() => cb({
          supported_resolutions: ["1D"],
        }), 0);
      },
      resolveSymbol: (symbol: string, onSymbolResolvedCallback: any) => {
        setTimeout(() => {
          onSymbolResolvedCallback({
            name: symbol,
            ticker: symbol,
            type: "multi",
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
      getBars: (symbol: string, resolution: string, from: number, to: number, onResult: any) => {
        const bars = (seriesData[symbol] || []).map((row: any) => ({
          time: new Date(row.date).getTime(),
          close: row.value,
          open: row.value,
          high: row.value,
          low: row.value,
          volume: 0,
        }));
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

    const mainSymbol = symbols[0];
    widgetRef.current = new TradingView.widget({
      symbol: mainSymbol,
      datafeed: multiSeriesDatafeed,
      interval: "1D",
      container: chartContainerRef.current,
      library_path: "/charting_library/",
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
      overrides: {},
      studies_overrides: {},
      onChartReady: function() {
        if (symbols.length > 1 && widgetRef.current) {
          for (let i = 1; i < symbols.length; ++i) {
            widgetRef.current.chart().createStudy('Compare', false, false, [symbols[i]], null, {
              'plot.color.0': '#'+((1<<24)*Math.random()|0).toString(16)
            });
          }
        }
      }
    });
  }, [isScriptReady, multiSeriesDatafeed, symbols]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "500px" }} />;
};


const transformData = (data: Record<string, any>[], symbols: string[]) => {
  const result = {};
  for (const symbol of symbols) {
    result[symbol] = data
      .filter(row => row[symbol] !== undefined && row[symbol] !== null)
      .map(row => ({
        date: row.date,
        value: row[symbol]
      }));
  }
  return result;
}
