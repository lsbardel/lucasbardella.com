import * as Plot from "@observablehq/plot";
import * as React from "react";

export interface PriceRow {
  delivery_date: string;
  price: number;
}

interface Props {
  data: PriceRow[];
}

/**
 * Replaces the Observable idiom
 *
 *   const prices = FileAttachment("...csv").csv({typed: true});
 *   display(resize((width) => wholesale(prices, {width})));
 *
 * The CSV is parsed at build time and handed in as a prop, so the island ships
 * data rather than fetching it. `resize` becomes a ResizeObserver.
 */
const PriceChart = ({ data }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rows = data.map((row) => ({ ...row, delivery_date: new Date(row.delivery_date) }));

    const draw = (width: number) => {
      el.replaceChildren();
      el.append(
        Plot.plot({
          width,
          height: 320,
          color: { legend: true },
          y: { grid: true, label: "price" },
          marks: [
            Plot.dot(rows, { x: "delivery_date", y: "price", stroke: "price", tip: true }),
            Plot.ruleY([0]),
          ],
        }),
      );
    };

    const observer = new ResizeObserver(([entry]) => draw(entry.contentRect.width));
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.replaceChildren();
    };
  }, [data]);

  return <div ref={ref} />;
};

export default PriceChart;
