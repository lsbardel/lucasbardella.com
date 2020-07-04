export default (element, options) => {
  Promise.all([
    notebook.require("d3-selection", "d3-fetch", "d3-geo", "topojson"),
    notebook.require("leaflet"),
  ]).then(([d3, L]) => {
    chinamap(d3, L, element, options);
  });
};

const state = {
  center: [32, 103.14],
  zoom: 4,
  wheelZoom: false,
  maxZoom: 18,
  http:
    "http://{s}.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

const chinamap = (d3, L, el, options) => {
  const topology = state[options.topology];

  if (options.topology && !topology) {
    d3.json(options.topology).then((topo) => {
      state[options.topology] = topo;
      if (topo) chinamap(d3, L, el, options);
    });
    return;
  } else if (!topology) return;

  // Add the Leaflet map
  const map = new L.map(el).setView(state.center, state.zoom);
  L.tileLayer(state.http, {
    attribution: state.attribution,
    id: "lsbardel.jlpfdli1",
    token: "pk.eyJ1IjoibHNiYXJkZWwiLCJhIjoidHltTnFxRSJ9.Mx5To8eaHJjq8OS6usKV8g",
    maxZoom: state.maxZoom,
  }).addTo(map);

  // add d3 & topojson overlay
  const transform = d3.geoTransform({
      point(x, y) {
        const point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
      },
    }),
    path = d3.geoPath().projection(transform);

  // make sure the svg element is created
  d3.select(map.getPanes().overlayPane)
    .selectAll("svg")
    .data([0])
    .enter()
    .append("svg")
    .classed("regions", true)
    .append("g");

  const collection = d3.feature(topology, topology.objects.china_adm1),
    svg = d3.select(el).selectAll("svg.regions"),
    g = svg.select("g");

  g.selectAll("path")
    .data(collection.features)
    .enter()
    .append("path")
    .style("fill", "#000")
    .style("fill-opacity", 0.2)
    .style("stroke", "#fff")
    .style("stroke-width", 1);
  g.selectAll("text")
    .data(collection.features)
    .enter()
    .append("svg:text")
    .text((d) => d.properties.name)
    .attr("text-anchor", "middle")
    .attr("font-size", "6pt");

  map.on("viewreset", reset);
  map.on("zoom", reset);
  reset();

  function reset() {
    var bounds = path.bounds(collection),
      topLeft = bounds[0],
      bottomRight = bounds[1];

    svg
      .attr("width", bottomRight[0] - topLeft[0])
      .attr("height", bottomRight[1] - topLeft[1])
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");

    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

    g.selectAll("path").attr("d", path);
    g.selectAll("text")
      .attr("x", (d) => path.centroid(d)[0])
      .attr("y", (d) => path.centroid(d)[1]);
  }
};
