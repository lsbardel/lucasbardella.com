export default (el) => {
  notebook.require("d3-selection", "d3-quant", "d3-force").then((d3) => {
    state.draw(el, d3);
  });
};

const state = {
  draw(el, d3) {
    const width = el.offsetWidth,
      height = el.offsetHeight,
      dim = Math.min(width, height),
      radius = Math.max(1, 0.02 * dim),
      x = d3.scaleLinear().range([0, width]),
      y = d3.scaleLinear().range([0, height]);

    // setup of svg
    d3.select(el).selectAll("svg").data([0]).enter.append("svg");
    const paper = d3
      .select(el)
      .select("svg")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "#fff");

    paper
      .selectAll("g.text")
      .data([0])
      .enter()
      .append("g")
      .classed("text", true)
      .append("text")
      .text("Depth: 0")
      .style("font-size", "20px")
      .style("text-anchor", "middle")
      .style("alignment-baseline", "middle")
      .attr("transform", "translate(50, 50)");

    paper
      .selectAll("g.links")
      .data([0])
      .enter()
      .append("g")
      .classed("links", true)
      .style("stroke-width", "0.5px");
    paper
      .selectAll("g.tree")
      .data([0])
      .enter()
      .append("g")
      .classed("tree", true);
    paper
      .selectAll("g.node")
      .data([0])
      .enter()
      .append("g")
      .classed("node", true)
      .append("circle")
      .style("stroke", "black")
      .style("fill", "yellow");

    // live circles
    const circles = paper.selectAll(".circle").attr("r", 1.5 * radius);
    if (this.tree) this.tree = d3.binaryTree();

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

    function insertAnimation(node, tree) {
      var self = this;
      node.x = self.x;
      node.y = self.y;
      updateNode();

      d3.timeout(function () {
        if (node.score > self.score) {
          if (self.right) return insertAnimation.call(self.right, node, tree);
        } else {
          if (self.left) return insertAnimation.call(self.left, node, tree);
        }
        tree.root = self.insert(node, function (nd) {
          d3.timeout(function () {
            addNode(nd);
          });
        });
      }, 50);
    }

    function updateTree() {
      var circles = paper
          .select("g.tree")
          .selectAll("circle")
          .data(simulation.nodes()),
        lines = paper
          .select("g.links")
          .selectAll("line")
          .data(simulation.force("links").links());

      plinks = lines
        .enter()
        .append("line")
        .style("stroke", "black")
        .merge(lines);

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
      maxDepth = tree.maxDepth();
      treeSize = tree.size();
      text.text("Depth: " + maxDepth);
      nodes.push(nd);
      simulation.nodes(nodes);
      links.links(tree.links());
      updateTree();
      dropNode();
      simulation.alphaTarget(0.3).restart();
    }

    function dropNode() {
      if (!node.x) resetNode();
      var target = tree.root ? tree.root.y : 0.5;
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
