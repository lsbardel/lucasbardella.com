import * as React from "react";
import { Button, Range } from "./inputs";
import Planarity from "./planarity";

/**
 * Replaces the Observable cells
 *
 *   const nodes = view(Inputs.range([5, 20], {step: 1, value: 8}));
 *   const replay = view(Inputs.button("New graph"));
 *
 * `Inputs.button` yields its click count, and Planarity rebuilds the graph
 * whenever that value changes, so a plain counter reproduces it exactly.
 */
const PlanarityDemo = () => {
  const [nodes, setNodes] = React.useState(8);
  const [replay, setReplay] = React.useState(0);
  return (
    <>
      <Range label="Number of vertices" value={nodes} onChange={setNodes} min={5} max={20} step={1} />
      <Button label="New graph" onClick={() => setReplay((count) => count + 1)} />
      <Planarity nodes={nodes} radius={10} replay={replay} aspectRatio="80%" />
    </>
  );
};

export default PlanarityDemo;
