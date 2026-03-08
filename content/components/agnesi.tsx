import * as d3 from "npm:d3";
import * as React from "npm:react";

interface Props {
  color?: string;
  aspectRatio?: string;
}

interface Pt { x: number; y: number; }

const N = 80;

const Agnesi = ({ color = "#aaa", aspectRatio = "40%" }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const halfWidth = el.offsetWidth / 2;
    const radius = Math.ceil(Math.min(halfWidth / 4, el.offsetHeight / 3));
    const padding = Math.ceil(radius / 2);
    const svgHeight = 2 * (padding + radius);
    const ystart = 2 * radius;
    const w1 = 8 * Math.pow(radius, 3);
    const w2 = 4 * Math.pow(radius, 2);

    const svg = d3.select(el)
      .append("svg")
      .attr("width", 2 * halfWidth)
      .attr("height", svgHeight)
      .style("display", "block")
      .style("cursor", "crosshair");

    const g = svg.append("g")
      .attr("transform", `translate(${halfWidth},${padding})`);

    // Reference circle
    g.append("circle")
      .attr("cy", radius).attr("r", radius)
      .style("stroke", color).style("stroke-width", 2).style("fill", "none");

    // Fixed center dot
    g.append("circle").attr("r", 2).attr("cy", radius).style("fill", color);

    // Three moving dots for the construction
    const dot1 = g.append("circle").attr("r", 5).style("fill", color); // on circle
    const dot2 = g.append("circle").attr("r", 5).style("fill", color); // on top axis
    const dot3 = g.append("circle").attr("r", 5).style("fill", color); // on curve

    const lineGen = d3.line<Pt>().x(d => d.x).y(d => d.y);
    const areaGen = d3.area<Pt>().x(d => d.x).y0(ystart).y1(d => d.y);

    // Construction line (from top axis through circle to baseline)
    const cline = g.append("line")
      .attr("x1", 0).attr("y1", ystart)
      .style("stroke", color).style("stroke-width", 1);

    // Baseline
    g.append("line")
      .attr("x1", -halfWidth).attr("y1", ystart)
      .attr("x2", halfWidth).attr("y2", ystart)
      .style("stroke", color);

    // Dot at baseline origin
    g.append("circle").attr("r", 5).attr("cy", ystart).style("fill", color);

    // Filled area under curve
    const areaPath = g.append("path")
      .style("fill", "#4a90d9").style("fill-opacity", 0.15);

    // Witch curve
    const curvePath = g.append("path")
      .style("stroke", "#999").style("stroke-width", 1.5).style("fill", "none");

    // Triangle showing the geometric construction
    const trianglePath = g.append("path")
      .style("fill", color).style("fill-opacity", 0.3);

    const point = (x: number): Pt => ({
      x,
      y: 2 * radius - w1 / (x * x + w2),
    });

    const draw = (xNorm: number) => {
      const x2 = xNorm * halfWidth;
      const dx = halfWidth / N;
      const n = Math.floor(((halfWidth - x2) * N) / halfWidth);
      const data: Pt[] = d3.range(n).map(i => point(halfWidth - dx * i));
      if (!data.length) return;
      if (data[data.length - 1].x > x2) data.push(point(x2));

      let x3 = 0, y3 = 0;
      if (x2) {
        const t = 4 / x2;
        const denom = t / x2 + 1 / (radius * radius);
        x3 = t / denom;
        y3 = 2 * radius * (1 - x3 / x2);
      }

      dot1.attr("cx", x3).attr("cy", y3);
      dot2.attr("cx", x2).attr("cy", 0);
      dot3.attr("cx", x2).attr("cy", y3);
      cline.attr("x2", x2).attr("y2", 0);
      curvePath.datum(data).attr("d", lineGen);
      areaPath.datum(data).attr("d", areaGen);
      trianglePath
        .datum([{ x: x2, y: 0 }, { x: x3, y: y3 }, { x: x2, y: y3 }])
        .attr("d", lineGen);
    };

    draw(0);

    svg.on("pointermove", (event: PointerEvent) => {
      const [mx] = d3.pointer(event, g.node());
      draw(Math.max(-1, Math.min(1, mx / halfWidth)));
    });

    return () => { el.innerHTML = ""; };
  }, [color]);

  const style = { width: "100%", position: "relative" as const, paddingTop: aspectRatio };
  const innerStyle = { position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0 };

  return (
    <div style={style}>
      <div ref={ref} style={innerStyle} />
    </div>
  );
};

export default Agnesi;
