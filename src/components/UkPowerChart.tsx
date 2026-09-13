import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as React from "react";
import { useRemote } from "./inputs";

interface Props {
  /** File name under public/data/wholesale, without the extension. */
  file: string;
  x: string;
  y: string;
  /** The wholesale chart colours by stroke, the daily one by fill. */
  colour: "stroke" | "fill";
  title: string;
  height?: number;
}

/**
 * Replaces the Observable cards on the UK power post:
 *
 *   <div class="card">
 *     <h2>UK Wholesale Energy Prices</h2>
 *     ${resize((width) => wholesale(prices, {width}))}
 *   </div>
 *
 * `resize` re-plotted on container width, so the port watches the container
 * with a ResizeObserver and redraws, which is the same behaviour.
 */
const UkPowerChart = ({ file, x, y, colour, title, height = 400 }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const data = useRemote(`/data/wholesale/${file}.csv`, (text) => d3.csvParse(text, d3.autoType));

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !data) return;

    const draw = () => {
      el.innerHTML = "";
      el.append(
        Plot.plot({
          width: el.offsetWidth,
          height,
          color: { legend: true },
          y: { grid: true },
          marks: [
            Plot.dot(data, { x, y, [colour]: y, tip: true }),
            Plot.ruleY([0]),
          ],
        }),
      );
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(el);
    return () => observer.disconnect();
  }, [data, x, y, colour, height]);

  return (
    <div className="card">
      <h2>{title}</h2>
      <div ref={ref} />
      {!data && <p>Loading prices…</p>}
    </div>
  );
};

export default UkPowerChart;
