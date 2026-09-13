import * as React from "react";
import { LargestHistogram } from "./histogram";
import { Range } from "./inputs";

/**
 * Replaces the Observable cell
 *
 *   const nn = view(Inputs.range([5, 50], {step: 1, label: "Number of rectangles", value: 20}));
 *
 * which the display cell above it referenced.
 */
const HistogramDemo = () => {
  const [n, setN] = React.useState(20);
  return (
    <>
      <Range label="Number of rectangles" value={n} onChange={setN} min={5} max={50} step={1} />
      <LargestHistogram N={n} H={15} speed={2000} aspectRatio="70%" />
    </>
  );
};

export default HistogramDemo;
