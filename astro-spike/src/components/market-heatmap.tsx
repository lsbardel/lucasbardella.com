import * as React from "react";
import { TradingViewHeatmap } from "./tradingview";
import { SOURCE_VALUES } from "./heatmap-sources";
import MarketSelect from "./market-select";

export interface HeatmapOption {
  value: string;
  label: string;
}

/**
 * Block sizes and groupings are short enough to keep inline. The market list
 * is generated, see heatmap-sources.ts.
 */
export const BLOCK_SIZES: HeatmapOption[] = [
  { value: "market_cap_basic", label: "Market cap" },
  { value: "volume", label: "Volume" },
  { value: "Value.Traded", label: "Value traded" },
];

export const GROUPINGS: HeatmapOption[] = [
  { value: "sector", label: "Sector" },
  { value: "no_group", label: "None" },
];

export interface HeatmapChoices {
  source: string;
  size: string;
  group: string;
}

interface MarketHeatmapProps {
  source?: string;
  size?: string;
  group?: string;
  theme?: string;
  aspectRatio?: string;
}

/**
 * Fall back to the default whenever the query string carries a value that is
 * not a known option, so a hand edited or stale link still renders.
 */
const coerce = (options: HeatmapOption[], value: string | null, fallback: string): string =>
  options.some((option) => option.value === value) ? (value as string) : fallback;

const readChoices = (search: string, defaults: HeatmapChoices): HeatmapChoices => {
  const params = new URLSearchParams(search);
  const source = params.get("source");
  return {
    source: source !== null && SOURCE_VALUES.has(source) ? source : defaults.source,
    size: coerce(BLOCK_SIZES, params.get("size"), defaults.size),
    group: coerce(GROUPINGS, params.get("group"), defaults.group),
  };
};

const toSearch = (choices: HeatmapChoices): string => {
  const params = new URLSearchParams();
  params.set("source", choices.source);
  params.set("size", choices.size);
  params.set("group", choices.group);
  return `?${params.toString()}`;
};

const labelClass = "block text-sm font-medium text-gray-300 mb-2";
const selectClass =
  "block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

const Field = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
  <div className="flex-1" style={{ minWidth: "10rem" }}>
    <label htmlFor={id} className={labelClass}>{label}</label>
    {children}
  </div>
);

const Choice = ({ id, label, value, options, onChange }: {
  id: string;
  label: string;
  value: string;
  options: HeatmapOption[];
  onChange: (value: string) => void;
}) => (
  <Field id={id} label={label}>
    <select id={id} value={value} className={selectClass} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </Field>
);

const MarketHeatmap = ({
  source = "SPX500",
  size = "market_cap_basic",
  group = "no_group",
  theme = "dark",
  aspectRatio = "100%",
}: MarketHeatmapProps) => {
  const defaults = React.useMemo<HeatmapChoices>(() => ({ source, size, group }), [source, size, group]);

  // Seed from the query string so a shared link opens on the right view.
  const [choices, setChoices] = React.useState<HeatmapChoices>(() =>
    typeof window === "undefined" ? defaults : readChoices(window.location.search, defaults),
  );

  // Write the defaults into a bare URL once, so the address bar is always
  // copyable. replaceState keeps this out of the history stack.
  React.useEffect(() => {
    if (typeof window === "undefined" || window.location.search !== "") return;
    window.history.replaceState(choices, "", `${window.location.pathname}${toSearch(choices)}`);
  }, []);

  // Back and forward move between previously selected views.
  React.useEffect(() => {
    const onPopState = () => setChoices(readChoices(window.location.search, defaults));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [defaults]);

  const update = (key: keyof HeatmapChoices) => (value: string) => {
    const next = { ...choices, [key]: value };
    setChoices(next);
    window.history.pushState(next, "", `${window.location.pathname}${toSearch(next)}`);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <Field id="heatmap-source" label="Market">
          <MarketSelect id="heatmap-source" value={choices.source} onChange={update("source")} />
        </Field>
        <Choice id="heatmap-size" label="Block size" value={choices.size} options={BLOCK_SIZES} onChange={update("size")} />
        <Choice id="heatmap-group" label="Grouping" value={choices.group} options={GROUPINGS} onChange={update("group")} />
      </div>
      <TradingViewHeatmap
        source={choices.source}
        blockSize={choices.size}
        grouping={choices.group}
        theme={theme}
        aspectRatio={aspectRatio}
      />
    </div>
  );
};

export default MarketHeatmap;
