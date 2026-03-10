import * as d3 from "npm:d3";
import * as React from "npm:react";

interface Wine {
  name: string;
  type: string;
  winegroup: string;
  country: string;
  size: number;
  method: string;
  grapes: string;
}

interface Props {
  data: Wine[];
  aspectRatio?: string;
}

const Sparkling = ({ data, aspectRatio = "60%" }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !data?.length) return;

    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const margin = 20;
    const diameter = Math.min(width, height);

    // Build hierarchy: root -> country -> winegroup -> wine
    const grouped = d3.group(data, d => d.country, d => d.winegroup);
    const root = d3.hierarchy({ name: "Sparkling wines", children: [...grouped.entries()].map(([country, groups]) => ({
      name: country,
      children: [...groups.entries()].map(([group, wines]) => ({
        name: group,
        children: wines.map(w => ({ ...w, value: +w.size || 1 })),
      })),
    })) })
      .sum(d => (d as any).value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3.pack<any>().size([diameter - margin, diameter - margin]).padding(1.5);
    const nodes = pack(root);

    const color = d3.scaleLinear<string>()
      .domain([-1, 5])
      .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
      .interpolate(d3.interpolateHcl as any);

    const svg = d3.select(el).append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("cursor", "pointer");

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2 - diameter / 2 + margin / 2},${height / 2 - diameter / 2 + margin / 2})`);

    let focus = root;
    let view: [number, number, number] = [root.x, root.y, root.r * 2 + margin];

    const circle = g.selectAll<SVGCircleElement, d3.HierarchyCircularNode<any>>("circle")
      .data(nodes.descendants())
      .join("circle")
      .attr("class", d => d.parent ? (d.children ? "node" : "node--leaf") : "node--root")
      .attr("fill", d => d.children ? color(d.depth) : "white")
      .attr("fill-opacity", d => d.children ? 0.7 : 0.5)
      .on("click", (event, d) => {
        if (focus !== d) { zoom(d); event.stopPropagation(); }
      });

    const label = g.selectAll<SVGTextElement, d3.HierarchyCircularNode<any>>("text")
      .data(nodes.descendants())
      .join("text")
      .attr("text-anchor", "middle")
      .attr("font-size", d => Math.max(8, d.r / 4))
      .attr("fill", "#fff")
      .style("fill-opacity", d => d.parent === root ? 1 : 0)
      .style("display", d => d.parent === root ? "inline" : "none")
      .text(d => d.data.name);

    svg.on("click", () => zoom(root));

    zoomTo(view);

    function zoom(d: d3.HierarchyCircularNode<any>) {
      focus = d;
      const transition = svg.transition().duration(750)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [d.x, d.y, d.r * 2 + margin]);
          return (t: number) => zoomTo(i(t));
        });

      label
        .filter(function(d) { return d.parent === focus || (this as SVGTextElement).style.display === "inline"; })
        .transition(transition as any)
        .style("fill-opacity", d => d.parent === focus ? 1 : 0)
        .on("start", function(d) { if (d.parent === focus) (this as SVGTextElement).style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) (this as SVGTextElement).style.display = "none"; });
    }

    function zoomTo(v: [number, number, number]) {
      view = v;
      const k = diameter / v[2];
      g.attr("transform", `translate(${width / 2},${height / 2})`);
      circle.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`)
        .attr("r", d => d.r * k);
      label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    }

    return () => { el.innerHTML = ""; };
  }, [data]);

  const style = { width: "100%", position: "relative" as const, paddingTop: aspectRatio };
  const innerStyle = { position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0 };

  return (
    <div style={style}>
      <div ref={ref} style={innerStyle} />
    </div>
  );
};

export default Sparkling;
