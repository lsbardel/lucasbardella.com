import "https://d3js.org/d3.v5.min.js";

const witch = { current: 0 },
  d3 = window.d3,
  color = "#666",
  N = 80;

const agnesi = (el) => {
  witch.width = el.offsetWidth / 2;
  witch.radius = Math.ceil(Math.min(witch.width / 4, el.offsetHeight / 3));

  var padding = Math.ceil(witch.radius / 2),
    height = 2 * (padding + witch.radius),
    ystart = 2 * witch.radius;

  witch.w1 = 8 * Math.pow(witch.radius, 3);
  witch.w2 = 4 * Math.pow(witch.radius, 2);
  witch.vis = d3
    .select(el)
    .html("")
    .append("svg")
    .on("mousemove", Mousemoved)
    .on("touchstart", Touchmove)
    .on("touchmove", Touchmove)
    .on("touchend", Touchmove)
    .attr("height", height)
    .attr("width", 2 * witch.width)
    .append("g")
    .attr("transform", "translate(" + witch.width + "," + padding + ")");
  witch.vis
    .append("circle")
    .attr("cy", witch.radius)
    .attr("r", witch.radius)
    .style("stroke-width", 2)
    .style("stroke", color)
    .style("fill", "none");
  witch.vis.append("circle").attr("r", 2).attr("cy", witch.radius).style("fill", color);

  witch.dot1 = witch.vis.append("circle").attr("r", 5).style("fill", color);
  witch.dot2 = witch.vis.append("circle").attr("r", 5).style("fill", color);
  witch.dot3 = witch.vis.append("circle").attr("r", 5).style("fill", color);
  witch._line = d3
    .line()
    .x(function (d) {
      return d.x;
    })
    .y(function (d) {
      return d.y;
    });
  witch._area = d3
    .area()
    .x(function (d) {
      return d.x;
    })
    .y0(function (d) {
      return ystart;
    })
    .y1(function (d) {
      return d.y;
    });
  witch.cline = witch.vis.append("line").attr("x1", 0).attr("y1", ystart).style("stroke", color);
  witch.vis
    .append("line")
    .attr("x1", -witch.width)
    .attr("y1", ystart)
    .attr("x2", witch.width)
    .attr("y2", ystart)
    .style("stroke", color);
  witch.vis.append("circle").attr("r", 5).attr("cy", ystart).style("fill", color);
  (witch.line = witch.vis.append("path").style("stroke", "#333").style("fill", "none")),
    (witch.area = witch.vis.append("path").style("fill", "#0036A3").style("fill-opacity", 0.1));
  witch.triangle = witch.vis.append("path").style("fill", color).style("fill-opacity", 0.3);
  // Draw
  draw(witch.current);
};

function Mousemoved() {
  var m = d3.mouse(this);
  draw((m[0] - witch.width) / witch.width);
}

function Touchmove() {
  d3.event.preventDefault();
  var m = d3.touches(this);
  draw((m[0] - witch.width) / witch.width);
}

function point(x) {
  return { x: x, y: 2 * witch.radius - witch.w1 / (x * x + witch.w2) };
}

function draw(x) {
  var x2 = x * witch.width,
    dx = witch.width / N,
    x3 = 0,
    y3 = 0,
    n = Math.floor(((witch.width - x2) * N) / witch.width),
    data = d3.range(n).map(function (i) {
      return point(witch.width - dx * i);
    });
  if (!data.length) return;
  if (data[data.length - 1].x > x2) {
    data.push(point(x2));
  }
  witch.current = x;
  // Intersection with circle
  if (x2) {
    var t = 4 / x2,
      d = t / x2 + 1 / (witch.radius * witch.radius);
    x3 = t / d;
    y3 = 2 * witch.radius * (1 - x3 / x2);
  }
  witch.dot1.attr("cx", x3).attr("cy", y3);
  witch.dot2.attr("cx", x2).attr("cy", 0);
  witch.dot3.attr("cx", x2).attr("cy", y3);
  witch.cline.attr("x2", x2).attr("y2", 0);
  witch.line.datum(data).attr("d", witch._line);
  witch.area.datum(data).attr("d", witch._area);
  witch.triangle
    .datum([
      { x: x2, y: 0 },
      { x: x3, y: y3 },
      { x: x2, y: y3 },
    ])
    .attr("d", witch._line);
}

export default (element) => {
  if (element) agnesi(element);
};
