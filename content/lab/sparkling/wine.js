define(["lodash", "d3", "jquery"], function (_, d3, $) {
  "use strict";
  //
  var VizDefaults = {
      debug: false,
      margin: 20,
      maxHeight: 500,
      key: null,
      query: null,
      orderby: null,
      reverse: false,
    },
    //
    googleEndpoint = "https://spreadsheets.google.com",
    //
    googleSheetsUri = function (key) {
      return googleEndpoint + "/feeds/worksheets/" + key + "/public/basic?alt=json";
    },
    //
    googleFeedsUri = function (key, sheet_id) {
      return googleEndpoint + "/feeds/list/" + key + "/" + sheet_id + "/public/values?alt=json";
    },
    //
    // A class for visualizing data using d3
    Vizualization = function (element, options) {
      options = _.extend({}, VizDefaults, options);
      //
      var self = this,
        $el = $(element),
        margin = options.margin,
        width = $el.width(),
        height = Math.min(width, options.maxHeight),
        svg = d3
          .select(element)
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
      //
      this.options = options;
      this.$el = $el;
      this.svg = svg;
      this.size = [width, height];
      //
      // Load data from google
      // The callback is called with a dictionary of Collections
      this.loadGoogleData = function (callback) {
        var outer = height / 4,
          inner = 0.75 * outer,
          twoPi = 2 * Math.PI,
          toload = null,
          sheetsToLoad = 0,
          progress = 0,
          arc = d3.svg.arc().startAngle(0).innerRadius(inner).outerRadius(outer),
          formatPercent = d3.format(".0%"),
          meter = svg.append("g").attr("class", "progress-meter");

        meter.append("path").attr("class", "background").attr("d", arc.endAngle(twoPi));

        var foreground = meter.append("path").attr("class", "foreground"),
          text = meter.append("text").attr("text-anchor", "middle").attr("dy", ".35em");

        var key = options.key;
        //
        d3.json(googleSheetsUri(key), function (data) {
          var collections = {};
          toload = loadSheets(data);
          sheetsToLoad = toload.length;
          _display_percentage();
          _(toload).forEach(function (path) {
            d3.json(path, function (json) {
              sheetsToLoad--;
              var col = new Collection({
                data: json,
              });
              collections[col.name] = col;
              _display_percentage();
              //
              if (!sheetsToLoad) {
                meter
                  .transition()
                  .delay(250)
                  .attr("transform", "scale(0)")
                  .each("end", function () {
                    if (callback) callback(collections);
                  });
              }
            });
          });
        });

        function _display_percentage() {
          var den = 1 + toload.length,
            percentage = (den - sheetsToLoad) / den;
          var i = d3.interpolate(progress, percentage);
          d3.transition().tween("progress", function () {
            return function (t) {
              progress = i(t);
              foreground.attr("d", arc.endAngle(twoPi * progress));
              text.text(formatPercent(progress));
            };
          });
        }

        function isWanted(name) {
          return true;
        }

        function loadSheets(data) {
          var i, ilen;
          var toLoad = [];
          var foundSheetNames = [];

          _(data.feed.entry).forEach(function (e) {
            foundSheetNames.push(e.title.$t);
            // Only pull in desired sheets to reduce loading
            if (isWanted(e.content.$t)) {
              var linkIdx = e.link.length - 1;
              var sheet_id = e.link[linkIdx].href.split("/").pop();
              var json_path = googleFeedsUri(options.key, sheet_id);
              if (self.query) {
                json_path += "&sq=" + self.query;
              }
              if (self.orderby) {
                json_path += "&orderby=column:" + self.orderby.toLowerCase();
              }
              if (self.reverse) {
                json_path += "&reverse=true";
              }
              toLoad.push(json_path);
            }
          });
          return toLoad;
        }
      };
    },
    //
    Collection = function (options) {
      var i, j, ilen, jlen;
      this.column_names = [];
      this.name = options.data.feed.title.$t;
      this.elements = [];
      this.raw = options.data; // A copy of the sheet's raw data, for accessing minutiae

      if (typeof options.data.feed.entry === "undefined") {
        options.tabletop.log(
          "Missing data for " + this.name + ", make sure you didn't forget column headers"
        );
        this.elements = [];
        return;
      }

      for (var key in options.data.feed.entry[0]) {
        if (/^gsx/.test(key)) this.column_names.push(key.replace("gsx$", ""));
      }

      for (i = 0, ilen = options.data.feed.entry.length; i < ilen; i++) {
        var source = options.data.feed.entry[i];
        var element = {};
        for (j = 0, jlen = this.column_names.length; j < jlen; j++) {
          var cell = source["gsx$" + this.column_names[j]];
          if (typeof cell !== "undefined") {
            if (options.parseNumbers && cell.$t !== "" && !isNaN(cell.$t))
              element[this.column_names[j]] = +cell.$t;
            else element[this.column_names[j]] = cell.$t;
          } else {
            element[this.column_names[j]] = "";
          }
        }
        if (element.rowNumber === undefined) element.rowNumber = i + 1;
        if (options.postProcess) options.postProcess(element);
        this.elements.push(element);
      }
    };

  //
  function collect(data, callback) {
    var collection = {};
    _(data).forEach(function (o) {
      callback(collection, o);
    });
    return collection;
  }

  function flatten(obj, type) {
    var data = [];
    _(obj).forEach(function (o, name) {
      if (!_.isArray(o)) o = flatten(o);
      data.push({
        name: name,
        children: o,
        type: type,
      });
    });
    return data;
  }

  function draw(viz, data) {
    var grape_links = {},
      margin = viz.options.margin,
      diameter = viz.size[1],
      dim = diameter - margin,
      view;

    // If the type is group create the groups
    function link(group, o) {
      if (!group[o.country]) group[o.country] = {};
      var country = group[o.country],
        wines = country[o.winegroup];
      if (!wines) country[o.winegroup] = wines = [];
      wines.push(o);
      _(o.grapes.split(",")).forEach(function (g) {
        g = g.toLowerCase().trim();
        var glinks = grape_links[g];
        if (g) {
          if (!glinks) grape_links[g] = glinks = [];
          glinks.push(o);
        }
      });
    }

    // setup the color scale
    var color = d3.scale
      .linear()
      .domain([-1, 5])
      .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
      .interpolate(d3.interpolateHcl);

    var root = {
        name: "Sparkling wines",
        children: flatten(collect(data, link), "country"),
      },
      focus = root,
      pack = d3.layout
        .pack()
        .size([dim, dim])
        .padding(1.5)
        .value(function (d) {
          return d.size;
        }),
      nodes = pack.nodes(root);

    // Create the svg box
    var g_wines = viz.svg.append("g").attr("class", "wines"),
      circle = g_wines
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", function (d) {
          return d.type || "group";
        })
        .attr("class", function (d) {
          return d.parent ? (d.children ? "node" : "node node--leaf") : "node node--root";
        })
        .style("fill", function (d) {
          return d.children ? color(d.depth) : "#fff";
        })
        .attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
        .on("click", function (d) {
          if (focus !== d) zoom(d);
          d3.event.stopPropagation();
        }),
      text = g_wines
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .style("fill-opacity", function (d) {
          return d.parent === root ? 1 : 0;
        })
        .style("display", function (d) {
          return d.parent === root ? null : "none";
        })
        .text(function (d) {
          return d.name;
        });

    // circles and text
    var node = g_wines.selectAll("circle,text");

    function zoom(d) {
      var focus0 = focus;
      focus = d;

      var transition = d3
        .transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function (d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function (t) {
            zoomTo(i(t));
          };
        });

      transition
        .selectAll("text.label")
        .filter(function (d) {
          return d.parent === focus || this.style.display === "inline";
        })
        .style("fill-opacity", function (d) {
          return d.parent === focus ? 1 : 0;
        })
        .each("start", function (d) {
          if (d.parent === focus) this.style.display = "inline";
        })
        .each("end", function (d) {
          if (d.parent !== focus) this.style.display = "none";
        });
    }

    function zoomTo(v) {
      var k = diameter / v[2];
      view = v;
      node.attr("transform", function (d) {
        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
      });
      circle.attr("r", function (d) {
        return d.r * k;
      });
    }

    d3.select("body").on("click", function () {
      zoom(root);
    });

    zoomTo([root.x, root.y, root.r * 2 + margin]);
  }

  // Function wich display the graph
  return function (element, options) {
    var viz = new Vizualization(element, options);
    viz.loadGoogleData(function (collections) {
      draw(viz, collections.wines.elements);
    });
  };
  //
  //
});
