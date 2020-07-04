// We need to keep a state across refresh
export default (el, options) => {
  notebook
    .require(
      "d3-selection",
      "d3-scale",
      "d3-drag",
      "d3-transition",
      "d3-timer",
      "d3-format"
    )
    .then((d3) => {
      planarity(el, d3, state, options);
    });
};

// We need to keep a state across refresh
const state = {
  nodes: 8,
  radius: 15,
  points: [],
  links: [],
  crosses: 0,
  start: 0,
  moves: 0,
  time: 0,
  strokeWidth: 2,
  circleColor: "#4DA6FF",
  linkColor: "#555",
  interSectionColor: "#ff7600",
  highlightIntersections: true,
  update() {},
};

const randomNode = (node) => {
  var x = Math.random(),
    y = Math.random();
  if (node) {
    node[0] = x;
    node[1] = y;
  } else {
    node = [x, y];
  }
  return node;
};

const scramble = (graph) => {
  if (graph.points.length < 4) return graph;
  do {
    graph.points.forEach(randomNode);
  } while (!intersections(graph.links));
};

const addPlanarLink = (link, links) => {
  if (
    !links.some(function (to) {
      return intersect(link, to);
    })
  ) {
    links.push(link);
  }
};
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];

// Returns true if two line segments intersect.
// Based on http://stackoverflow.com/a/565282/64009
const intersect = (a, b) => {
  // Check if the segments are exactly the same (or just reversed).
  if ((a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]))
    return true;

  // Represent the segments as p + tr and q + us, where t and u are scalar
  // parameters.
  var p = a[0],
    r = [a[1][0] - p[0], a[1][1] - p[1]],
    q = b[0],
    s = [b[1][0] - q[0], b[1][1] - q[1]];

  // Solve p + tr = q + us to find an intersection point.
  // First, cross both sides with s:
  //   (p + tr) × s = (q + us) × s
  // We know that s × s = 0, so this can be rewritten as:
  //   t(r × s) = (q − p) × s
  // Then solve for t to get:
  //   t = (q − p) × s / (r × s)
  // Similarly, for u we get:
  //   u = (q − p) × r / (r × s)
  var rxs = cross(r, s),
    q_p = [q[0] - p[0], q[1] - p[1]],
    t = cross(q_p, s) / rxs,
    u = cross(q_p, r) / rxs,
    epsilon = 1e-6;

  return t > epsilon && t < 1 - epsilon && u > epsilon && u < 1 - epsilon;
};

const intersections = (links) => {
  var n = links.length,
    i = -1,
    j,
    x,
    count = 0;
  // Reset flags.
  while (++i < n) {
    (x = links[i]).intersection = false;
    x[0].intersection = false;
    x[1].intersection = false;
  }
  i = -1;
  while (++i < n) {
    x = links[i];
    j = i;
    while (++j < n) {
      if (intersect(x, links[j])) {
        x.intersection = x[0].intersection = x[1].intersection = links[
          j
        ].intersection = links[j][0].intersection = links[
          j
        ][1].intersection = true;
        count++;
      }
    }
  }
  return count;
};

const planarity = (el, d3, graph, options) => {
  // Generates a random planar graph with *n* nodes.
  options = { ...graph, ...options };
  const format = d3.format(",.2f");

  graph.update = options.update ? options.update : graph.update;
  if (graph.points.length !== options.nodes || options.restart) {
    graph.nodes = options.nodes;
    graph.points = [];
    graph.links = [];
    graph.start = new Date();
    graph.moves = 0;
    if (!graph.timer)
      graph.timer = d3.timer(() => {
        if (graph.crosses) {
          graph.time = format((new Date() - graph.start) / 1000);
          graph.update(graph);
        }
      });
    for (let i = 0; i < graph.nodes; i++) graph.points.push(randomNode());
    for (let i = 0; i < graph.nodes; i++)
      addPlanarLink(
        [
          graph.points[i],
          graph.points[Math.floor(Math.random() * graph.nodes)],
        ],
        graph.links
      );
    for (let i = 0; i < graph.nodes; i++)
      for (let j = i + 1; j < graph.nodes; j++)
        addPlanarLink([graph.points[i], graph.points[j]], graph.links);
    scramble(graph);
  }
  // Set-up paper (first time only)
  const g = d3
    .select(el)
    .selectAll("svg")
    .data([0])
    .enter()
    .append("svg")
    .append("g");
  g.append("g").attr("class", "links");
  g.append("g").attr("class", "nodes");

  // re-draw the graph
  const padding = graph.radius + 2;
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const vis = d3
    .select(el)
    .selectAll("svg")
    .attr("height", height)
    .attr("width", width)
    .selectAll("g")
    .attr("transform", "translate(" + [padding, padding] + ")");
  const lines = vis
    .selectAll(".links")
    .style("stroke-width", graph.strokeWidth)
    .style("stroke", graph.linkColor);
  const nodes = vis
    .selectAll(".nodes")
    .style("stroke-width", graph.strokeWidth)
    .style("stroke", graph.linkColor)
    .style("fill", graph.circleColor);

  const x = d3.scaleLinear().range([0, width - 2 * padding]);
  const y = d3.scaleLinear().range([0, height - 2 * padding]);
  update(options.restart);

  function update(transition) {
    graph.crosses = intersections(graph.links);
    const intersect = graph.highlightIntersections
      ? (d) => (d.intersection ? graph.interSectionColor : graph.linkColor)
      : graph.linkColor;

    var line = lines.selectAll("line").data(graph.links);
    line.exit().transition().remove();
    line
      .enter()
      .append("line")
      .attr("x1", (d) => x(d[0][0]))
      .attr("y1", (d) => y(d[0][1]))
      .attr("x2", (d) => x(d[1][0]))
      .attr("y2", (d) => y(d[1][1]))
      .style("stroke", intersect);

    if (transition) line = line.transition();
    line
      .attr("x1", (d) => x(d[0][0]))
      .attr("y1", (d) => y(d[0][1]))
      .attr("x2", (d) => x(d[1][0]))
      .attr("y2", (d) => y(d[1][1]))
      .style("stroke", intersect);

    const circles = nodes.selectAll("circle");
    let node = circles.data(graph.points);
    node.exit().transition().remove();
    node
      .enter()
      .append("circle")
      .attr("r", graph.radius)
      .attr("cx", (d) => x(d[0]))
      .attr("cy", (d) => y(d[1]))
      .call(
        d3
          .drag()
          .on("start", (d) => {
            if (!graph.crosses) circles.on(".drag", null);
            else
              return {
                x: x(d[0]),
                y: y(d[1]),
              };
          })
          .on("drag", (d) => {
            // Jitter to prevent coincident nodes.
            d[0] =
              Math.max(0, Math.min(1, x.invert(d3.event.x))) +
              Math.random() * 1e-4;
            d[1] =
              Math.max(0, Math.min(1, y.invert(d3.event.y))) +
              Math.random() * 1e-4;
            update();
          })
          .on("end", () => {
            ++graph.moves;
            options.update(graph);
          })
      );

    if (transition) node = node.transition();
    node.attr("cx", (d) => x(d[0])).attr("cy", (d) => y(d[1]));
    options.update(graph);
  }
};
