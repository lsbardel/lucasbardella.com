import "https://cdn.jsdelivr.net/npm/d3-require";

const state = { type: "svg", time: 0 };

export default (el, options) => {
  notebook
    .require(
      "d3-selection",
      "d3-scale",
      "d3-geo",
      "d3-timer",
      "d3-fetch",
      "topojson",
      "stats.js"
    )
    .then((d3) => {
      draw(el, d3, {
        // rotation per minute
        rotation: 2,
        longitude: -40,
        sea: "#efedf5",
        land: "#cc4c02",
        stroke: "#662506",
        graticule: {
          show: true,
          color: "#000",
          colorOpacity: 0.3,
          lineWidth: 0.5,
        },
        ...options,
      });
    });
};

const draw = (el, d3, opts) => {
  var globe = { type: "Sphere" },
    width = el.offsetWidth,
    height = el.offsetHeight,
    radius = Math.min(width, height) * 0.45,
    projection = d3
      .geoOrthographic()
      .clipAngle(90)
      .scale(radius)
      .translate([width / 2, height / 2]),
    path = d3.geoPath().projection(projection);

  d3.scaleLinear().domain([0, width]);
  d3.scaleLinear().domain([0, height]);

  if (!state.world) {
    d3.json(opts.geometry).then((w) => {
      state.world = w;
      state.lng = +opts.longitude;
      state.land = d3.feature(state.world, state.world.objects.land);
      state.countries = d3.feature(state.world, state.world.objects.countries);
      state.timer = d3.timer(rotate);
    });
  }

  const rotate = () => {
    const rotation = Math.min(Math.max(0, opts.rotation), 1000),
      now = d3.now(),
      delta =
        rotation > 0 && state.time
          ? (360 * rotation * (now - state.time)) / 60000
          : 0;

    let build = false;

    if (!state.ref || state.type !== state.type) {
      state.ref = state.type === "svg" ? svg_world() : canvas_world();
      build = true;
    }

    if (build || delta) {
      // Rotate projection
      state.time = now;
      state.lng += delta;
      projection.rotate([state.lng, 0]);
      state.ref.draw();
    }
    return true;
  };

  const svg_world = () => {
    const g = d3
      .select(el)
      .html("")
      .append("svg")
      .attr("height", height)
      .attr("width", width);
    g.attr("stroke", opts.stroke)
      .append("path")
      .datum(globe)
      .attr("class", "globe")
      .attr("fill", opts.sea)
      .attr("d", path);
    g.append("path")
      .datum(state.land.geometry)
      .attr("class", "land")
      .attr("fill", opts.land)
      .attr("d", path);
    g.selectAll(".country")
      .data([state.countries])
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("fill", "none")
      .attr("d", path);
    if (opts.graticule.show) {
      g.append("path")
        .datum(d3.geoGraticule())
        .attr("class", "graticule")
        .attr("fill", "none")
        .attr("stroke", opts.graticule.color)
        .attr("stroke-opacity", opts.graticule.colorOpacity)
        .attr("stroke-width", opts.graticule.lineWidth + "px")
        .attr("d", path);
    }
    const draw = () => {
      g.selectAll("path").attr("d", path.projection(projection));
    };
    draw();
    return { draw };
  };

  function canvas_world() {
    var ctx = state.context();

    ctx.strokeStyle = opts.stroke;
    ctx.fillStyle = opts.sea;
    redrawCanvas(ctx, globe, true);
    ctx.fillStyle = opts.land;
    redrawCanvas(ctx, state.land, true);
    redrawCanvas(ctx, state.countries);
    if (opts.graticule.show) {
      var graticule = d3.geo.graticule();
      d3.canvas.style(ctx, opts.graticule);
      redrawCanvas(ctx, graticule());
    }
  }

  function redrawCanvas(ctx, obj, fill) {
    ctx.beginPath();
    path.context(ctx)(obj);
    if (fill) ctx.fill();
    ctx.stroke();
  }
};
