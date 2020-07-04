export default (el) => {
  notebook.require("d3-selection", "d3-scale", "d3-shape").then((d3) => {
    draw(el, d3, {
      margin: 0,
      color: "#707070",
      nodes: 2,
      radius: 0.1,
      ny: 30,
    });
  });
};

const draw = (el, d3, opts) => {
  const width = el.offsetWidth,
    height = el.offsetHeight,
    radius = opts.radius,
    g = d3
      .select(el)
      .html("")
      .append("svg")
      .attr("height", height)
      .attr("width", width),
    Nx = opts.nx ? +opts.nx : 20,
    Ny = opts.ny ? +opts.ny : 5,
    c = g.selectAll("circle").data([true]),
    sm = (0.5 * height) / width,
    scalex = d3.scaleLinear().range([0, width]).domain([-0.5, 0.5]),
    scaley = d3.scaleLinear().range([0, height]).domain([-sm, sm]),
    scaler = d3.scaleLinear().range([0, width]).domain([0, 1]),
    lineup = d3
      .line()
      .x(function (d) {
        return scalex(d.x);
      })
      .y(function (d) {
        return scaley(d.y);
      })
      .curve(d3.curveCardinal),
    linedo = d3
      .line()
      .x(function (d) {
        return scalex(d.x);
      })
      .y(function (d) {
        return scaley(-d.y);
      })
      .curve(d3.curveCardinal);

  let a2 = radius * radius,
    dy = sm / Ny,
    data = [],
    linedata,
    m,
    x,
    y,
    r,
    theta0,
    thetaN,
    dd,
    phi,
    theta,
    stheta,
    p;

  c.enter()
    .append("circle")
    .attr("cx", scalex(0))
    .attr("cy", scaley(0))
    .attr("r", scaler(radius))
    .attr("fill", "#61A0FF");

  const addpath = (cn, line) => {
    var path = g.selectAll("path." + cn).data(data);
    path
      .enter()
      .append("path")
      .classed(cn, true)
      .attr("d", function (d) {
        return line(d);
      })
      .attr("stroke", opts.color)
      .attr("stroke-width", 1)
      .attr("fill", "none");
    path.exit().remove();
  };

  for (let j = 0; j < Ny; ++j) {
    m = j ? j : 0.3;
    y = m * dy;
    x = 0.5;
    r = Math.sqrt(x * x + y * y);
    theta0 = Math.atan2(y, x);
    thetaN = 0.5 * Math.PI - theta0;
    dd = (0.5 * Math.PI) / Nx;
    // The value of the phi
    phi = (a2 / r - r) * Math.sin(theta0);
    linedata = [{ x: -x, y: y }];
    linedata[2 * Nx] = { x: x, y: y };
    data.push(linedata);
    for (let i = 1; i < Nx; ++i) {
      theta = theta0 + thetaN * (1 - Math.cos(i * dd));
      stheta = Math.sin(theta);
      p = phi / stheta;
      r = 0.5 * (Math.sqrt(p * p + 4 * a2) - p);
      y = r * stheta;
      x = r * Math.cos(theta);
      linedata[i] = { x: -x, y: y };
      linedata[2 * Nx - i] = { x: x, y: y };
    }
    linedata[Nx] = { x: 0, y: 0.5 * (Math.sqrt(phi * phi + 4 * a2) - phi) };
  }

  addpath("up", lineup);
  addpath("down", linedo);
};
