// Requires giotto
//  http://quantmind.github.io/giotto/
define(rcfg.min(['giotto/giotto', 'topojson']), function (d3, topojson) {
    "use strict";

    var

    gt = d3.giotto,

    W = gt.createviz('rotatingworld', {
        // rotation per minute
        rotation: 1,
        longitude: -40,
        sea: '#efedf5',
        land: '#cc4c02',
        stroke: '#662506',
        graticule: {
            show: true,
            color: '#000',
            colorOpacity: 0.3,
            lineWidth: 0.5
        }
    },

    function (self, opts) {
        var globe = {type: "Sphere"},
            projection = d3.geo.orthographic().clipAngle(90),
            group, worldtopo, lng, path, land, countries, time;

        self.on('tick.rotation', function () {
            time = rotate();
        });

        function load() {
            if (!opts.src)
                gt.log.error('No source, cannot load world');
            else
                d3.json(opts.src, function (w) {
                    worldtopo = w;
                    lng = +opts.longitude;
                    land = topojson.feature(worldtopo, worldtopo.objects.land);
                    countries = topojson.feature(worldtopo, worldtopo.objects.countries);
                    self.resume();
                });
        }

        function rotate () {
            if (!worldtopo) {
                self.stop();
                return load();
            }

            var rotation = Math.min(Math.max(0, opts.rotation), 1000),
                build = group ? group.type() !== opts.type : true,
                delta = 0,
                t = gt._.now();

            if (build) {
                group = self.paper(true).group();
                group.type() === 'svg' ? group.add(svg_world) : group.add(canvas_world);
            }

            var width = group.innerWidth(),
                height = group.innerHeight(),
                radius = Math.min(width, height) * 0.5;

                projection.scale(radius)
                            .translate([width/2, height/2]);
                path = d3.geo.path().projection(projection);

            group.xaxis().scale().domain([0, width]);
            group.yaxis().scale().domain([0, height]);

            if (rotation > 0 && time)
                delta = 360 * rotation * (t - time) / 60000;

            if (build || delta) {
                // Rotate projection
                lng += delta;
                projection.rotate([lng, 0]);
                group.render();
            }

            self.resume();
            return t;
        }

        function svg_world () {
            var gg = group.element();
            if (!gg.selectAll('.globe').size()) {
                gg.attr('stroke', opts.stroke);
                gg.append('path')
                    .datum(globe)
                    .attr('class', 'globe')
                    .attr('fill', opts.sea)
                    .attr("d", path);
                gg.append('path')
                    .datum(land.geometry)
                    .attr('class', 'land')
                    .attr('fill', opts.land)
                    .attr("d", path);
                gg.selectAll(".country")
                    .data([countries])
                    .enter().append('path')
                    .attr('class', 'country')
                    .attr('fill', 'none')
                    .attr("d", path);
                if (opts.graticule.show) {
                    var g = d3.geo.graticule();
                    gg.append('path')
                        .datum(g)
                        .attr("class", "graticule")
                        .attr("fill", "none")
                        .attr('stroke', opts.graticule.color)
                        .attr('stroke-opacity', opts.graticule.colorOpacity)
                        .attr('stroke-width', opts.graticule.lineWidth + 'px')
                        .attr("d", path);
                }
            }
            gg.selectAll("path")
                .attr("d", path.projection(projection));
        }

        function canvas_world () {
            var ctx = group.context();

            ctx.strokeStyle = opts.stroke;
            ctx.fillStyle = opts.sea;
            redrawCanvas(ctx, globe, true);
            ctx.fillStyle = opts.land;
            redrawCanvas(ctx, land, true);
            redrawCanvas(ctx, countries);
            if (opts.graticule.show) {
                var graticule = d3.geo.graticule();
                d3.canvas.style(ctx, opts.graticule);
                redrawCanvas(ctx, graticule());
            }
        }

        function redrawCanvas (ctx, obj, fill) {
            ctx.beginPath();
            path.context(ctx)(obj);
            if (fill)
                ctx.fill();
            ctx.stroke();
        }

    });

    gt.angular.directive(W, 'giottoRotatingworld');
    return W;
});