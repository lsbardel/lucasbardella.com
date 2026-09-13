import * as d3 from "d3";
import * as React from "react";
import { useRemote } from "./inputs";

interface Row {
  code: string;
  path: string;
  label: string;
  lastUpdate: string;
  lastModified: string;
  dataStart: string;
  dataEnd: string;
  count: number;
}

const dataUrl = (code: string) =>
  `https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/${code}/?format=SDMX-CSV&compressed=true&i`;

const htmlUrl = (code: string) => `https://ec.europa.eu/eurostat/databrowser/view/${code}/default/table`;

const COLUMNS: (keyof Row)[] = [
  "code",
  "path",
  "label",
  "lastUpdate",
  "lastModified",
  "dataStart",
  "dataEnd",
  "count",
];

/** The Observable table virtualised its rows; this caps the rendered page instead. */
const PAGE = 100;

/**
 * Replaces the three Observable cells that made up this page:
 *
 *   const search = view(Inputs.search(catalogue));
 *   const row = view(Inputs.table(search, {multiple: false, ...}));
 *   if (row?.code) display(Inputs.table(Object.entries(row), ...));
 *
 * `Inputs.search` matched a query against every column, and `Inputs.table` with
 * `multiple: false` published the selected row, which the third cell expanded
 * into a detail view. All three become one component with two pieces of state.
 */
const EurostatCatalogue = () => {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Row | null>(null);
  const catalogue = useRemote("/data/eurostat/catalogue.csv", (text) => d3.csvParse(text) as unknown as Row[]);

  const matches = React.useMemo(() => {
    if (!catalogue) return [];
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return catalogue;
    return catalogue.filter((row) => {
      const haystack = COLUMNS.map((column) => row[column]).join(" ").toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [catalogue, query]);

  if (!catalogue) return <p>Loading the Eurostat catalogue…</p>;

  const shown = matches.slice(0, PAGE);
  const cell = "px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs";

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <input
          type="search"
          value={query}
          placeholder="Search the catalogue…"
          onChange={(event) => setQuery(event.target.value)}
          className="px-2 py-1 rounded border border-[var(--foreground-fainter)] bg-[var(--surface)] w-72"
        />
        <span className="text-sm text-[var(--foreground-faint)]">
          {matches.length.toLocaleString()} of {catalogue.length.toLocaleString()} datasets
          {matches.length > PAGE && `, showing the first ${PAGE}`}
        </span>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto text-sm">
        <table>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column} className={cell}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr
                key={row.code}
                onClick={() => setSelected(row)}
                className={`cursor-pointer ${selected?.code === row.code ? "bg-[var(--surface)]" : ""}`}
              >
                {COLUMNS.map((column) => (
                  <td key={column} className={cell} title={String(row[column])}>
                    {column === "code" ? (
                      <a href={htmlUrl(row.code)} target="_blank" rel="noopener noreferrer">{row.code}</a>
                    ) : (
                      row[column]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <table className="text-sm">
          <tbody>
            {COLUMNS.map((column) => (
              <tr key={column}>
                <td className="w-32 text-[var(--foreground-faint)]">{column}</td>
                <td>
                  {column === "code" ? (
                    <a href={htmlUrl(selected.code)} target="_blank" rel="noopener noreferrer">{selected.code}</a>
                  ) : (
                    selected[column]
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td className="w-32 text-[var(--foreground-faint)]">url</td>
              <td>
                <a href={dataUrl(selected.code)} target="_blank" rel="noopener noreferrer">download</a>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EurostatCatalogue;
