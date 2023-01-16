export default (notebook, el) => {
  notebook
    .require("d3-selection", "d3-quant@0.5.1", "d3-scale", "d3-timer", "d3-force", "d3-random")
    .then((d3) => {
      state.draw(el, d3);
    });
};

const state = {
  radius: 0.01,
  dropRadiusScale: 1.5,
  c1: 0.5,
  c2: 0.3,
  draw(el, d3) {
    const width = el.offsetWidth,
      height = el.offsetHeight,
      dim = Math.min(width, height),
      radius = Math.max(1, this.radius * dim),
      x = d3.scaleLinear().range([0, width]),
      y = d3.scaleLinear().range([0, height]);

    this.el = el;
    // setup of svg
    d3.select(el)
      .selectAll("svg")
      .data([0])
      .enter()
      .append("svg")
      .style("background-color", "#999");
    const paper = d3.select(el).select("svg").attr("width", width).attr("height", height);

    paper
      .selectAll("g.legend")
      .data([0])
      .enter()
      .append("g")
      .attr("transform", "translate(50, 50)")
      .classed("legend", true)
      .selectAll("g")
      .data(["depth", "red", "black"])
      .enter()
      .append((d, index) => {
        const g = d3
          .select(document.createElement("g"))
          .attr("transform", `translate(0, ${2 * radius * index})`);
        if (d === "depth") g.append("text").text("Depth").style("fill", "black");
        else g.append("circle").style("fill", d).attr("cx", 0).attr("cy", 0).attr("r", radius);
        g.append("text").text("0").classed(d, true).style("fill", d);
        return g.node();
      });

    paper.selectAll("text").style("font-size", "20px");
    //.style("text-anchor", "middle")
    //.style("alignment-baseline", "middle");
    paper
      .selectAll("g.links")
      .data([0])
      .enter()
      .append("g")
      .classed("links", true)
      .style("stroke-width", "0.5px");
    paper.selectAll("g.tree").data([0]).enter().append("g").classed("tree", true);
    paper
      .selectAll("g.circle")
      .data([0])
      .enter()
      .append("g")
      .classed("circle", true)
      .append("circle")
      .style("stroke", "black")
      .style("fill", "yellow")
      .attr("r", this.dropRadiusScale * radius);

    // live circles
    const textDepth = paper.select("text.depth"),
      textRed = paper.select("text.red"),
      textBlack = paper.select("text.black"),
      circle = paper
        .select("g.circle")
        .select("circle")
        .attr("r", this.dropRadiusScale * radius);
    let plinks, pnodes;
    if (!this.node) {
      this.node = {};
      this.generator = d3.randomUniform(0, 1);
    }
    const { generator, node } = this;

    if (!this.tree) {
      const { c1, c2 } = this;
      this.node = {};
      this.tree = binaryTree();
      this.generator = d3.randomUniform(0, 1);
      this.simulation = d3
        .forceSimulation()
        //.force("center", d3.forceCenter(0.5, 0.5))
        .force("body", d3.forceManyBody().strength(-0.002))
        .force("links", d3.forceLink().strength(0.2).distance(0.005))
        .force(
          "x",
          d3
            .forceX(function (nd) {
              if (nd.parent) {
                var x1 = nd.parent.parent ? nd.parent.parent.x : 0.5;
                return c2 * (c1 * nd.parent.x + (1 - c1) * x1) + (1 - c2) * 0.5;
              }
              return 0.5;
            })
            .strength(function (nd) {
              if (!nd.depth) return 5;
              return Math.min(0.005 * (tree.size + 1), 5);
            })
        )
        .force(
          "y",
          d3
            .forceY(function (nd) {
              return 0.1 + (0.8 * (1 + nd.depth)) / (tree.maxDepth + 2);
            })
            .strength(function (nd) {
              if (!nd.depth) return 5;
              return Math.min(0.5 * (tree.maxDepth + 1), 5);
            })
        )
        .on("tick", tick);
      // drop the first value
      resetNode();
      updateNode();
      d3.timeout(dropNode, 1000);
    }
    const { simulation, tree } = this;

    updateTree();

    function tick() {
      if (pnodes) {
        plinks
          .attr("x1", function (d) {
            return x(d.source.x);
          })
          .attr("y1", function (d) {
            return y(d.source.y);
          })
          .attr("x2", function (d) {
            return x(d.target.x);
          })
          .attr("y2", function (d) {
            return y(d.target.y);
          });
        pnodes
          .attr("cx", function (d) {
            return x(d.x);
          })
          .attr("cy", function (d) {
            return y(d.y);
          });
      }
    }

    function binaryTree() {
      const tree = d3.binaryTree();
      const insert = tree.insert;
      const doInsert = (node) => {
        insert.call(tree, node, (nd) => d3.timeout(() => addNode(nd)));
      };
      tree.insert = insertAnimation;
      return tree;

      function insertAnimation(node) {
        if (!tree.root) return doInsert(node);
        const self = this.depth ? this : this.root;
        node.x = self.x;
        node.y = self.y;
        updateNode();

        d3.timeout(function () {
          if (node.score > self.score) {
            if (self.right) return insertAnimation.call(self.right, node);
          } else {
            if (self.left) return insertAnimation.call(self.left, node);
          }
          doInsert(node);
        }, 50);
      }
    }

    function updateTree() {
      var circles = paper.select("g.tree").selectAll("circle").data(simulation.nodes()),
        lines = paper.select("g.links").selectAll("line").data(simulation.force("links").links());

      plinks = lines.enter().append("line").style("stroke", "black").merge(lines);

      pnodes = circles
        .enter()
        .append("circle")
        .attr("r", radius)
        .style("stroke", "black")
        .merge(circles)
        .style("fill", function (d) {
          return d.red ? "red" : "black";
        });
    }

    function addNode(nd) {
      var nodes = simulation.nodes(),
        links = simulation.force("links");
      resetNode();
      if (nd.parent) {
        nd.x = nd.parent.x;
        nd.y = nd.parent.y;
      }
      textDepth.text(tree.maxDepth);
      let red = 0,
        black = 0;
      tree.traverse((n) => {
        if (n.red) red++;
        else black++;
      });
      textRed.text(red);
      textBlack.text(black);
      nodes.push(nd);
      simulation.nodes(nodes);
      links.links(tree.links());
      updateTree();
      dropNode();
      simulation.alphaTarget(0.3).restart();
    }

    function dropNode() {
      if (!node.x) resetNode();
      const target = tree.root ? tree.root.y : 0.5;
      node.y += 0.01;
      if (node.y >= target) tree.insert(node);
      else {
        updateNode();
        d3.timeout(dropNode, 10);
      }
    }

    function resetNode() {
      node.x = 0.5;
      node.y = -0.15;
      node.score = generator();
    }

    function updateNode() {
      circle.attr("cx", x(node.x)).attr("cy", y(node.y));
    }
  },
};
