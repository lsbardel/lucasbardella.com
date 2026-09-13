import * as React from "react";

export interface Column<T> {
  key: keyof T & string;
  header: string;
  /** Cell renderer, the equivalent of Inputs.table's `format` option. */
  format?: (value: any, row: T) => React.ReactNode;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  height?: number;
  /** Set for a single-selection table, the `multiple: false` Inputs.table. */
  onSelect?: (row: T) => void;
  selected?: T | null;
}

/**
 * Stands in for `Inputs.table`: a scrollable table with per-column formatting
 * and, when asked, single row selection.
 */
export const DataTable = <T,>({ rows, columns, height = 400, onSelect, selected }: Props<T>) => (
  <div className="overflow-auto text-sm my-4" style={{ maxHeight: height }}>
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} className="text-left px-2 py-1 whitespace-nowrap">{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={index}
            onClick={onSelect ? () => onSelect(row) : undefined}
            className={`${onSelect ? "cursor-pointer" : ""} ${selected === row ? "bg-[var(--surface)]" : ""}`}
          >
            {columns.map((column) => (
              <td key={column.key} className="px-2 py-1 whitespace-nowrap">
                {column.format ? column.format(row[column.key], row) : String(row[column.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * The htl-based `sparkbar` from components/sparkbar.ts, as a React cell: a bar
 * scaled to the column maximum with the value written at its right edge.
 */
export const sparkbar =
  (max: number, color: string, formatter?: (x: number) => string) =>
  (value: number): React.ReactNode => {
    const format = formatter ?? ((x: number) => x.toLocaleString("en"));
    return (
      <div
        style={{
          background: color,
          width: `${(100 * value) / max}%`,
          float: "right",
          paddingRight: "3px",
          boxSizing: "border-box",
          overflow: "visible",
          display: "flex",
          justifyContent: "end",
        }}
      >
        {format(value)}
      </div>
    );
  };
