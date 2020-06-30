import "https://d3js.org/d3.v5.min.js";

const d3 = window.d3;

// Generates a random planar graph with *n* nodes.
function planarGraph(n) {
  var points = [],
    links = [],
    i,
    j;
  for (i = 0; i < n; i++) points[i] = randomNode();
  for (i = 0; i < n; i++) addPlanarLink([points[i], points[Math.floor(Math.random() * n)]], links);
  for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) addPlanarLink([points[i], points[j]], links);
  return {
    nodes: points,
    links: links,
  };
}

function randomNode(node) {
  var x = Math.random(),
    y = Math.random();
  if (node) {
    node[0] = x;
    node[1] = y;
  } else {
    node = [x, y];
  }
  return node;
}

// Scramble the node positions.
function scramble(graph) {
  if (graph.nodes.length < 4) return graph;
  do {
    graph.nodes.forEach(randomNode);
  } while (!intersections(graph.links));
  return graph;
}

// Adds a link if it doesn't intersect with anything.
function addPlanarLink(link, links) {
  if (
    !links.some(function (to) {
      return intersect(link, to);
    })
  ) {
    links.push(link);
  }
}

// Counts the number of intersections for a given array of links.
function intersections(links) {
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
        x.intersection = x[0].intersection = x[1].intersection = links[j].intersection = links[
          j
        ][0].intersection = links[j][1].intersection = true;
        count++;
      }
    }
  }
  return count;
}

// Returns true if two line segments intersect.
// Based on http://stackoverflow.com/a/565282/64009
function intersect(a, b) {
  // Check if the segments are exactly the same (or just reversed).
  if ((a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0])) return true;

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
}

function cross(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}

// Planarity Class
function Planarity(elem, options) {
  //
  var graph,
    x,
    y,
    p = 15,
    self = $.extend(
      this,
      {
        nodes: 8,
        //
        count: 0,
        //
        strokeWidth: 2,
        //
        circleColor: "#4DA6FF",
        //
        linkColor: "#555",
        //
        interSectionColor: "#ff7600",
        //
        height: 500,
        //
        highlightIntersections: true,
        //
        start: function () {
          this.started = new Date();
          this.moves = 0;
          this.count = 0;
          this.lastCount = null;
          graph = scramble(planarGraph(this.nodes));
          update();
        },
      },
      options
    );

  function update() {
    self.count = intersections(graph.links);

    var line = lines.selectAll("line").data(graph.links);
    line.enter().append("line");
    line.exit().remove();
    line
      .attr("x1", function (d) {
        return x(d[0][0]);
      })
      .attr("y1", function (d) {
        return y(d[0][1]);
      })
      .attr("x2", function (d) {
        return x(d[1][0]);
      })
      .attr("y2", function (d) {
        return y(d[1][1]);
      })
      .style(
        "stroke",
        self.highlightIntersections
          ? function (d) {
              return d.intersection ? self.interSectionColor : self.linkColor;
            }
          : self.linkColor
      );

    var node = nodes.selectAll("circle").data(graph.nodes);
    node
      .enter()
      .append("circle")
      .attr("r", p - 1)
      .call(
        d3.behavior
          .drag()
          .origin(function (d) {
            return {
              x: x(d[0]),
              y: y(d[1]),
            };
          })
          .on("drag", function (d) {
            // Jitter to prevent coincident nodes.
            d[0] = Math.max(0, Math.min(1, x.invert(d3.event.x))) + Math.random() * 1e-4;
            d[1] = Math.max(0, Math.min(1, y.invert(d3.event.y))) + Math.random() * 1e-4;
            update();
          })
          .on("dragend", function () {
            ++self.moves;
          })
      );
    node.exit().remove();
    node
      .attr("cx", function (d) {
        return x(d[0]);
      })
      .attr("cy", function (d) {
        return y(d[1]);
      });
  }

  function resize() {
    var w = jel.width(),
      h = Math.min(w, self.height);
    (x = d3.scale.linear().range([0, w - 2 * p])), (y = d3.scale.linear().range([0, h - 2 * p]));
    jel.height(h);
    jel.children("svg").attr("width", w).attr("height", h);
    if (graph) update();
  }

  var jel = $(elem).empty(),
    vis = d3
      .select(elem)
      .attr("class", "planarity")
      .append("svg")
      .append("g")
      .attr("transform", "translate(" + [p, p] + ")"),
    lines = vis
      .append("g")
      .attr("class", "links")
      .style("stroke-width", self.strokeWidth)
      .style("stroke", self.linkColor),
    nodes = vis
      .append("g")
      .attr("class", "nodes")
      .style("stroke-width", self.strokeWidth)
      .style("stroke", self.linkColor)
      .style("fill", self.circleColor);

  $(window).resize(resize);
  resize();

  return this;
}
