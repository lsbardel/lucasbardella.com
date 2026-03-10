import * as d3 from "npm:d3";
import * as d3quant from "npm:d3-quant";
import * as React from "npm:react";

interface Props {
  rounding?: number;
  levels?: number;
  aspectRatio?: string;
}

const Pi = ({ rounding = 5, levels = 50, aspectRatio = "70%" }: Props) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const animRef = React.useRef<{ timer: d3.Timer | null; circle: number; total: number; nodes: any[]; done: boolean }>({
    timer: null, circle: 0, total: 0, nodes: [], done: false,
  });
  const [stats, setStats] = React.useState({ points: 0, pi: "—" });

  const run = React.useCallback((restart: boolean) => {
    const el = containerRef.current;
    if (!el) return;

    const anim = animRef.current;
    if (anim.timer) { anim.timer.stop(); anim.timer = null; }

    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const radius = 0.5 * 0.7 * Math.min(width, height);
    const rmin = Math.max(1, 0.02 * radius);
    const rmax = 4 * rmin;

    const colors = d3.scaleOrdinal(d3.range(levels, 0, -1).map(t => d3.interpolateInferno(t / levels)));
    const cx = d3.scaleLinear().range([width / 2, radius]).domain([0, levels]);
    const cy = d3.scaleLinear().range([height / 2, radius]).domain([0, levels]);
    const cr = d3.scaleLinear().range([rmax, rmin]).domain([0, levels]);

    if (restart || !svgRef.current) {
      el.innerHTML = "";
      anim.circle = 0; anim.total = 0; anim.nodes = []; anim.done = false;

      const svg = d3.select(el).append("svg").attr("width", width).attr("height", height);
      svgRef.current = svg.node();

      svg.append("rect")
        .attr("x", width / 2 - radius).attr("y", height / 2 - radius)
        .attr("width", 2 * radius).attr("height", 2 * radius)
        .attr("fill", "none").attr("stroke", "#8daac0").attr("stroke-width", 2);

      svg.append("circle")
        .attr("cx", width / 2).attr("cy", height / 2).attr("r", radius)
        .attr("fill", "#df7810").attr("fill-opacity", 0.5).attr("stroke", "#1f77b4").attr("stroke-width", 2);

      svg.append("g").attr("class", "nodes").attr("transform", `translate(${width / 2},${height / 2})`);
    }

    const svg = d3.select(svgRef.current!);
    const nodesG = svg.select<SVGGElement>(".nodes");
    const target = d3quant.round(Math.PI, rounding);

    const sobol = d3quant.sobol(2);

    anim.timer = d3.timer(() => {
      if (!anim.done) {
        const xy = sobol.next();
        const px = 2 * (xy[0] - 0.5);
        const py = 2 * (xy[1] - 0.5);
        anim.total++;
        if (px * px + py * py < 1) anim.circle++;
        const pival = (4 * anim.circle) / anim.total;
        anim.nodes.push({ x: px, y: py, l: 0 });
        const piRounded = d3quant.round(pival, rounding);
        setStats({ points: anim.total, pi: piRounded.toFixed(rounding) });
        if (piRounded === target) anim.done = true;
      }

      anim.nodes.forEach(n => { if (n.l < levels) n.l++; });

      const circles = nodesG.selectAll<SVGCircleElement, any>("circle").data(anim.nodes);
      circles.enter().append("circle").merge(circles)
        .attr("cx", d => cx(d.l) * d.x)
        .attr("cy", d => cy(d.l) * d.y)
        .attr("r", d => cr(d.l))
        .attr("fill", d => colors(d.l));
    });
  }, [rounding, levels]);

  React.useEffect(() => {
    run(true);
    return () => { if (animRef.current.timer) animRef.current.timer.stop(); };
  }, [run]);

  const style = { width: "100%", position: "relative" as const, paddingTop: aspectRatio };
  const innerStyle = { position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0 };

  return (
    <div style={style}>
      <div style={innerStyle}>
        <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, display: "flex", gap: "1rem", alignItems: "center" }}>
          <button onClick={() => run(true)} style={{ padding: "4px 12px", cursor: "pointer" }}>Restart</button>
          <span>π ≈ {stats.pi}</span>
          <span>points: {stats.points}</span>
        </div>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

export default Pi;
