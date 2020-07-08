const noop = () => {};

const state = {
  margin: 0,
  height: "100%",
  rounding: 5,
  rmin: 0.02,
  rscale: 4,
  levels: 50,
  size: 0.7,
  circleColor: "#1f77b4",
  circleOpacity: 0.5,
  strokeColor: "#1f77b4",
  impactColor: "#000",
  strokeWidth: 2,
  nodes: [],
  pi: 0,
  draw(el, options) {
    notebook
      .require(
        "d3-selection",
        "d3-scale",
        "d3-array",
        "d3-scale-chromatic",
        "d3-timer",
        "d3-quant"
      )
      .then((d3) => {
        draw(el, d3, options);
      });
  },
};

const draw = (el, d3, options) => {
  options = options || {};
  let svg = d3.select(el).selectAll("svg").data([0]).enter().append("svg");
  svg.append("rect");
  svg.append("circle");
  svg.append("g").classed("nodes", true);

  const width = el.offsetWidth,
    update = options.update || noop,
    height = el.offsetHeight,
    radius = 0.5 * state.size * Math.min(width, height),
    rmin = Math.max(1, state.rmin * radius),
    rmax = state.rscale * rmin,
    levels = state.levels,
    colors = d3.scaleOrdinal(
      d3.range(levels, 0, -1).map((t) => d3.interpolateInferno(t / levels))
    ),
    x = d3.scaleLinear().range([0, width]).domain([-1, 1]),
    y = d3.scaleLinear().range([0, height]).domain([-1, 1]),
    cx = d3
      .scaleLinear()
      .range([width / 2, radius])
      .domain([0, levels]),
    cy = d3
      .scaleLinear()
      .range([height / 2, radius])
      .domain([0, levels]),
    cr = d3.scaleLinear().range([rmax, rmin]).domain([0, state.levels]);

  svg = d3.select(el).select("svg").attr("height", height).attr("width", width);
  svg
    .select("rect")
    .attr("x", x(0) - radius)
    .attr("y", y(0) - radius)
    .attr("width", 2 * radius)
    .attr("height", 2 * radius)
    .attr("fill", "none")
    .attr("stroke", state.strokeColor)
    .attr("stroke-width", state.strokeWidth);
  svg
    .select("circle")
    .attr("cx", x(0))
    .attr("cy", y(0))
    .attr("r", radius)
    .classed("target", true)
    .attr("fill", state.circleColor)
    .attr("fill-opacity", state.circleOpacity)
    .attr("stroke-width", state.strokeWidth)
    .attr("stroke", state.scrokeColor);
  const nodes = svg
    .select(".nodes")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  if (!state.anim || options.restart) {
    if (state.anim) {
      state.anim.viz.stop();
      state.anim = undefined;
      nodes.html("");
    }
    state.anim = {
      sobol: d3.sobol(2),
      nodes: [],
      circle: 0,
      total: 0,
      target: d3.round(Math.PI, state.rounding),
    };
    state.anim.viz = d3.timer(() => {
      if (!state.anim.targetValue) {
        const xy = state.anim.sobol.next();

        const node = {
          x: 2 * (xy[0] - 0.5),
          y: 2 * (xy[1] - 0.5),
          l: 0,
        };
        state.anim.total += 1;
        if (node.x * node.x + node.y * node.y < 1) state.anim.circle += 1;

        const pival = (4 * state.anim.circle) / state.anim.total;
        state.anim.pi = d3.round(pival, state.rounding);
        state.anim.nodes.push(node);
        if (state.anim.pi === state.anim.target) state.anim.targetValue = pival;
        update(state.anim);
      }

      state.anim.nodes.forEach((node) => {
        if (node.l < levels) node.l++;
      });
      render();
    });
  } else {
    render();
  }

  function render() {
    const circles = nodes.selectAll("circle").data(state.anim.nodes);
    circles
      .enter()
      .append("circle")
      .attr("cx", (d) => cx(d.l) * d.x)
      .attr("cy", (d) => cy(d.l) * d.y)
      .attr("r", (d) => cr(d.l))
      .attr("fill", (d) => colors(d.l));

    circles
      .attr("cx", (d) => cx(d.l) * d.x)
      .attr("cy", (d) => cy(d.l) * d.y)
      .attr("r", (d) => cr(d.l))
      .attr("fill", (d) => colors(d.l));
  }
};

export default state;
