import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

export const tsZoom = ({width, height, initialStartEnd, setStartEnd, title, marks} = {}) => {
  return Plot.plot({
    title,
    width,
    height,
    x: {axis: null},
    y: {ticks: false, grid: false, label: null},
    color: {scheme: "spectral"},
    marks: [
      ...marks,
      (index, scales, channels, dimensions, context) => {
        const x1 = dimensions.marginLeft;
        const y1 = 0;
        const x2 = dimensions.width - dimensions.marginRight;
        const y2 = dimensions.height;
        const brushed = (event) => {
          if (!event.sourceEvent) return;
          let {selection} = event;
          if (!selection) {
            const r = 10; // radius of point-based selection
            let [px] = d3.pointer(event, context.ownerSVGElement);
            px = Math.max(x1 + r, Math.min(x2 - r, px));
            selection = [px - r, px + r];
            g.call(brush.move, selection);
          }
          setStartEnd(selection.map(scales.x.invert));
        };
        const pointerdowned = (event) => {
          const pointerleave = new PointerEvent("pointerleave", {bubbles: true, pointerType: "mouse"});
          event.target.dispatchEvent(pointerleave);
        };
        const brush = d3.brushX().extent([[x1, y1], [x2, y2]]).on("brush end", brushed);
        const g = d3.create("svg:g").call(brush);
        g.call(brush.move, initialStartEnd.map(scales.x));
        g.on("pointerdown", pointerdowned);
        return g.node();
      }
    ]
  });
};
