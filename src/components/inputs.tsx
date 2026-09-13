import * as React from "react";

/**
 * React stand-ins for the `Inputs.*` controls the Observable lab pages used.
 *
 * On the Observable side a control was a separate `js` cell:
 *
 *   const speed = view(Inputs.range([0, 10], {step: 0.5, value: 2, label: "Speed"}));
 *
 * and the runtime re-ran every cell that referenced `speed`. Astro has no such
 * runtime, so each page gets a `*Demo` component that owns the state and passes
 * it down as props. These helpers keep those demos close to the original cells.
 *
 * Layout note: site.css sets `label { display: block }` outside any cascade
 * layer, which beats Tailwind's `flex` utility because layered rules lose to
 * unlayered ones. So a row is a div with a span, never a flex label.
 */

const row = "flex items-center gap-2 text-sm mb-2";
const name = "w-40 shrink-0 text-[var(--foreground-faint)]";
const readout = "w-14 shrink-0 tabular-nums text-[var(--foreground-faint)]";

/** Two column control block, matching `<div class="grid grid-cols-2">` on the old pages. */
export const Controls = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-4">{children}</div>
);

interface RangeProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}

export const Range = ({ label, value, onChange, min, max, step = 1 }: RangeProps) => (
  <div className={row}>
    <span className={name}>{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
    <span className={readout}>{value}</span>
  </div>
);

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}

export const Select = ({ label, value, onChange, options }: SelectProps) => (
  <div className={row}>
    <span className={name}>{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const Toggle = ({ label, value, onChange }: ToggleProps) => (
  <div className={row}>
    <span className={name}>{label}</span>
    <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
  </div>
);

interface ColorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const Color = ({ label, value, onChange }: ColorProps) => (
  <div className={row}>
    <span className={name}>{label}</span>
    <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
    <span className={readout}>{value}</span>
  </div>
);

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const Button = ({ label, onClick }: ButtonProps) => (
  <div className={row}>
    <span className={name} />
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1 rounded border border-[var(--foreground-fainter)] bg-[var(--surface)] cursor-pointer"
    >
      {label}
    </button>
  </div>
);

/**
 * Replaces `FileAttachment(...).csv()` / `.json()`. The file lives in public/,
 * so it is fetched at runtime rather than resolved at build time.
 */
export const useRemote = <T,>(url: string, parse: (text: string) => T): T | null => {
  const [data, setData] = React.useState<T | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`${url} returned ${response.status}`);
        return response.text();
      })
      .then((text) => !cancelled && setData(parse(text)))
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
    // `parse` is defined inline by callers, so it is deliberately not a dependency.
  }, [url]);
  return data;
};
