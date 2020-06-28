define(rcfg.min(['topojson']), function (topojson) {
    "use strict";
    //
    window.chinamap = {
        center: [32, 103.14],
        wheelZoom: false,
        buildMap: function () {

            var viz = this,
                map = viz.map,
                http = 'http://{s}.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}',
                MB_ATTR = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                          '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                          'Imagery © <a href="http://mapbox.com">Mapbox</a>';

            viz.addLayer(http, {
                attribution: MB_ATTR,
                id: 'lsbardel.jlpfdli1',
                token: 'pk.eyJ1IjoibHNiYXJkZWwiLCJhIjoidHltTnFxRSJ9.Mx5To8eaHJjq8OS6usKV8g'
            });

            if (this.attrs.src)
                d3.json(this.attrs.src, function(topology) {

                    var collection = topojson.feature(topology, topology.objects.china_adm1),
                        svgLayer = viz.addSvgLayer(collection, draw),
                        feature = svgLayer.g.selectAll("path")
                                        .data(collection.features)
                                        .enter().append("path")
                                        .on('click', function (d) {
                                            var hash = d.properties.name,
                                                scope = viz.attrs.scope;
                                            if (scope && scope.$location) {
                                                scope.$location.hash(lux.slugify(hash));
                                                scope.$apply();
                                            }
                                        }),
                        text = svgLayer.g.selectAll("text")
                                    .data(collection.features)
                                    .enter()
                                    .append("svg:text")
                                    .text(function (d) {
                                        return d.properties.name;
                                    })
                                    .attr("text-anchor","middle")
                                    .attr('font-size','6pt');
                    svgLayer.svg.attr("class", "china-wine");
                    svgLayer.draw();

                    function draw (svgLayer) {
                        feature.attr("d", svgLayer.path);
                        text.attr("x", function(d) {
                            return svgLayer.path.centroid(d)[0];
                        }).attr("y", function(d) {
                            return svgLayer.path.centroid(d)[1];
                        });
                    }
                });
        }
    };
});