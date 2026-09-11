import * as React from "npm:react";
import { type HeatmapSource, type HeatmapSourceGroup, SOURCE_GROUPS } from "./heatmap-sources.js";
import { filterGroups, findSource } from "./market-filter.js";

interface MarketSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

const inputClass =
  "block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
const listClass =
  "absolute z-20 mt-1 w-full max-h-72 overflow-y-auto border border-gray-600 bg-gray-800 rounded-md shadow-lg sm:text-sm";
const groupClass = "px-3 py-1 text-xs uppercase tracking-wide text-gray-500 bg-gray-900 sticky top-0";
const optionClass = "px-3 py-2 cursor-pointer text-gray-300";
const optionActiveClass = "px-3 py-2 cursor-pointer bg-indigo-600 text-white";

/**
 * A searchable combobox over the market list. Deliberately controlled, so that
 * a back or forward navigation can push a new value in from the URL.
 */
const MarketSelect = ({ id, value, onChange }: MarketSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const container = React.useRef<HTMLDivElement>(null);
  const list = React.useRef<HTMLUListElement>(null);

  const selected = findSource(value);
  const groups = React.useMemo<HeatmapSourceGroup[]>(() => (open ? filterGroups(query) : SOURCE_GROUPS), [open, query]);
  const flat = React.useMemo(() => groups.flatMap((group) => group.sources), [groups]);

  const close = React.useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  // Clicking anywhere else dismisses the list without changing the selection.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, close]);

  // Keep the highlighted row visible while arrowing through a long list.
  React.useEffect(() => {
    if (!open) return;
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const commit = (source: HeatmapSource) => {
    onChange(source.value);
    close();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      setQuery("");
      setActive(0);
      event.preventDefault();
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown") {
      setActive((index) => (flat.length === 0 ? 0 : (index + 1) % flat.length));
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      setActive((index) => (flat.length === 0 ? 0 : (index - 1 + flat.length) % flat.length));
      event.preventDefault();
    } else if (event.key === "Enter") {
      if (flat[active]) commit(flat[active]);
      event.preventDefault();
    } else if (event.key === "Escape") {
      close();
      event.preventDefault();
    } else if (event.key === "Tab") {
      close();
    }
  };

  let index = -1;
  return (
    <div className="relative" ref={container}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={open && flat[active] ? `${id}-option-${active}` : undefined}
        autoComplete="off"
        className={inputClass}
        value={open ? query : selected?.label ?? ""}
        placeholder={open ? selected?.label ?? "Search markets" : undefined}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
          setActive(0);
        }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul className={listClass} id={`${id}-listbox`} role="listbox" ref={list}>
          {flat.length === 0 && <li className="px-3 py-2 text-gray-500">No market matches</li>}
          {groups.map((group) => (
            <React.Fragment key={group.country}>
              <li className={groupClass} role="presentation">{group.country}</li>
              {group.sources.map((source) => {
                index += 1;
                const position = index;
                return (
                  <li
                    key={source.value}
                    id={`${id}-option-${position}`}
                    data-index={position}
                    role="option"
                    aria-selected={source.value === value}
                    className={position === active ? optionActiveClass : optionClass}
                    onMouseEnter={() => setActive(position)}
                    // mousedown fires before blur, so the click is not lost
                    onMouseDown={(event) => {
                      event.preventDefault();
                      commit(source);
                    }}
                  >
                    {source.label}
                  </li>
                );
              })}
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MarketSelect;
