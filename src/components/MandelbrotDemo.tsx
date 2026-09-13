import * as React from "react";
import FullScreen from "./FullScreen";
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
 *
 * Full screen keeps the palette control, floated over the set rather than
 * stacked above it. The set keeps its own 69% proportions. Note that the zoom
 * lives inside Mandelbrot's effect, which FullScreen remounts, so toggling
 * returns to the default view.
 */
const MandelbrotDemo = ({ maxIter = 256 }: Props) => {
  const [palette, setPalette] = React.useState("Turbo");
  return (
    <FullScreen ratio={0.69} label="Mandelbrot set">
      {({ isFullScreen }) => (
        <>
          <div
            className={
              isFullScreen
                ? "absolute top-2 left-2 z-10 rounded border border-[var(--foreground-fainter)] bg-[var(--surface)] px-3 pt-3"
                : "pr-8"
            }
          >
            <label>
              Palette
              <select value={palette} onChange={(event) => setPalette(event.target.value)}>
                {Object.keys(schemes).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>
          <Mandelbrot maxIter={maxIter} palette={palette} />
        </>
      )}
    </FullScreen>
  );
};

export default MandelbrotDemo;
