import * as React from "react";
import Mandelbrot from "./Mandelbrot";
import { schemes } from "./palettes";

interface Props {
  maxIter?: number;
}

/**
 * Replaces the Observable idiom
 *
 *   const palette = view(Inputs.select(Object.keys(schemes), {value: "Turbo"}));
 *   display(<Mandelbrot maxIter={256} palette={palette} />);
 *
 * Observable's runtime re-ran the display cell whenever the input changed. Here
 * the control and the state live in the component instead, which is the whole
 * of the conversion work for a page like this.
 */
const MandelbrotDemo = ({ maxIter = 256 }: Props) => {
  const [palette, setPalette] = React.useState("Turbo");
  return (
    <>
      <label>
        Palette
        <select value={palette} onChange={(event) => setPalette(event.target.value)}>
          {Object.keys(schemes).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>
      <Mandelbrot maxIter={maxIter} palette={palette} />
    </>
  );
};

export default MandelbrotDemo;
