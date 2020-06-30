import "https://d3js.org/d3.v5.min.js";

export default (el) => {
  draw(el, window.d3, {
    margin: 0,
    height: "100%",
    rounding: 5,
    rmin: 0.01,
    rmax: 0.04,
    levels: 50,
    circleColor: "#1f77b4",
    circleOpacity: 0.5,
    strokeColor: "#1f77b4",
    impactColor: "#000",
    strokeWidth: 2,
  });
};

const draw = (el, d3, opts) => {
  const width = el.offsetWidth,
    height = el.offsetHeight,
    g = d3.select(el).html("").append("svg").attr("height", height).attr("width", width),
    nodes = [],
    colors = d3.scale.category20c().range().splice(4, 8),
    target = d3.round(Math.PI, opts.rounding),
    radiusScale = d3.scale.linear().range([opts.rmax, opts.rmin]).domain([0, opts.levels]),
    colorScale = d3.scale.linear().range(colors).domain([0, opts.levels]),
    scalex = d3.linearScale().domain([-1, 1]),
    scaley = d3.linearScale().domain([-1, 1]),
    scale = d3.linearScale().domain([0, 2]);

  let _anim, done;

  g.append("rect")
    .attr("fill", "none")
    .attr("stroke", opts.strokeColor)
    .attr("stroke-width", opts.strokeWidth);
  g.append("circle")
    .classed("target", true)
    .attr("fill", opts.circleColor)
    .attr("fill-opacity", opts.circleOpacity)
    .attr("stroke-width", opts.strokeWidth)
    .attr("stroke", opts.scrokeColor);

  g.append("g").classed("done", true);

  group.add(function () {
    var g = group.element(),
      s = group.element().selectAll(".node").data(nodes),
      d = group.element().select(".done"),
      e;

    g.select("rect")
      .attr("x", scalex(-0.5))
      .attr("y", scaley(0.5))
      .attr("height", scale(1))
      .attr("width", scale(1));

    g.select(".target").attr("cx", scalex(0)).attr("cy", scaley(0)).attr("r", scale(0.5));

    for (var i = 0; i < done.length; ++i)
      d.append("circle")
        .attr("fill", opts.impactColor)
        .attr("cx", scalex(done[i].x))
        .attr("cy", scaley(done[i].y))
        .attr("r", scale(opts.rmin));

    s.enter().append("circle").classed("node", true);
    s.exit().remove();
    s.attr("cx", function (d) {
      return scalex(d.x);
    })
      .attr("cy", function (d) {
        return scaley(d.y);
      })
      .attr("fill", function (d) {
        return d.c;
      })
      .attr("r", function (d) {
        return scale(d.r);
      });
    return s;
  });

  viz.on("tick.main", function (e) {
    var i = 0,
      anim = getAnim(true),
      node,
      xy,
      xj,
      yj,
      pival;

    if (!anim.targetValue) {
      xy = anim.sobol.next();
      xj = Math.random();
      yj = Math.random();

      node = {
        x: 2 * (xy[0] - 0.5),
        y: 2 * (xy[1] - 0.5),
        l: -1,
      };
      anim.total += 1;
      if (node.x * node.x + node.y * node.y < 1) anim.circle += 1;
      if (xj * xj + yj * yj < 1) anim.js += 1;

      pival = (4 * anim.circle) / anim.total;
      anim.pi = d3.round(pival, opts.rounding);
      nodes.push(node);
      if (anim.pi === target) anim.targetValue = pival;
    }

    var moving = [];
    done = [];
    nodes.forEach(function (node) {
      node.l++;
      if (node.l <= opts.levels) {
        if (node.l) {
          node.x -= node.dx;
          node.y -= node.dy;
        } else {
          node.dx = (0.5 * node.x) / opts.levels;
          node.dy = (0.5 * node.y) / opts.levels;
        }
        node.r = radiusScale(node.l);
        node.c = colorScale(node.l);
        moving.push(node);
      } else done.push(node);
    });

    nodes = moving;
    group.render();

    if (nodes.length) {
      viz.resume();
    } else {
      anim.finished = true;
      viz.stop();
    }
  });

  // Private stuff

  function getAnim(createNew) {
    if (!_anim || _anim.finished) {
      g.select(".done").selectAll("*").remove();
      g.selectAll(".node").remove();
      _anim = {
        total: 0,
        circle: 0,
        js: 0,
        sobol: d3.giotto.math.sobol(2),
      };
    }
    return _anim;
  }

  if (opts.scope) {
    var scope = opts.scope;

    scope.pi = 0;
    scope.total = 0;
    scope.animate = function () {
      if (viz.alpha()) viz.stop();
      else viz.resume();
    };

    viz
      .on("tick.angular", function () {
        scope.action = "Pause";
        scope.pi = _anim.pi;
        scope.total = _anim.total;
        scope.$apply();
      })
      .on("end", function () {
        scope.action = "Animate";
        if (scope.$$phase !== "$apply") scope.$apply();
      });
  }
};
