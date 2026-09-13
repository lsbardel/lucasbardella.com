import * as React from "react";
import { Range, useRemote } from "./inputs";
import RotatingWorld from "./rotating-world";

/**
 * Replaces the Observable pair
 *
 *   const world = FileAttachment("../../data/world-110m.json").json();
 *   const speed = view(Inputs.range([0, 10], {step: 0.5, value: 2}));
 *
 * The topology is 106 kB, so it stays in public/ and is fetched rather than
 * bundled into the page.
 */
const RotatingWorldDemo = () => {
  const [speed, setSpeed] = React.useState(2);
  const world = useRemote("/data/world-110m.json", (text) => JSON.parse(text));
  return (
    <>
      <Range label="Speed (rpm)" value={speed} onChange={setSpeed} min={0} max={10} step={0.5} />
      {world ? <RotatingWorld world={world} speed={speed} /> : <p>Loading the world…</p>}
    </>
  );
};

export default RotatingWorldDemo;
