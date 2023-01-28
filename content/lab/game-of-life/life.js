class GameOfLife extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.squares = new Map();
    this.dark = {
      new: "#1d91c0",
      alive: "#fff",
      dead: "#e31a1c",
    };
    this.light = {
      new: "#1d91c0",
      alive: "#333",
      dead: "#e31a1c",
    };
  }

  async connectedCallback() {
    const ar = this.getAttribute("aspect-ratio");
    const options = {
      speed: +(this.getAttribute("speed") || 200),
      delta: +(this.getAttribute("delta") || 10),
      patternUrl: this.getAttribute("pattern-url"),
      style: notebook.options.mode == "dark" ? this.dark : this.light,
    };
    const root = this.shadowRoot || this;
    root.innerHTML = ar
      ? `<div class="module-outer" style="width: 100%; position: relative; padding-top:${ar}">
        <div class="module" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0"></div>
      </div>`
      : `<div class="module"></div>`;
    this.paper = root.querySelector(".module");
    notebook
      .require("d3-selection", "d3-timer", "d3-fetch", "d3-array", "d3-transition")
      .then((d3) => {
        this.animate({ d3, ...options });
      });
  }

  disconnectedCallback() {
    if (this.timer) this.timer.stop();
  }

  load(state, game) {
    const { d3, squares, patternUrl } = state;
    if (patternUrl) {
      d3.csv(patternUrl).then((data) => {
        squares.clear();
        game.reset(data);
        this.draw(state);
      });
    }
  }

  animate(options) {
    const width = this.paper.offsetWidth;
    const height = this.paper.offsetHeight;
    const { delta, speed, d3, style } = options;
    const squares = new Map();
    const state = {
      ...options,
      squares,
      width,
      height,
      Ny: Math.floor(height / delta),
      Nx: Math.floor(width / delta),
    };
    const game = gameOfLife(state);
    const radius = delta / 2;

    this.load(state, game);

    this.timer = d3.interval(() => {
      const cells = game.step();
      const { alive, dead } = state;

      if (!alive) return;

      let stylet = false,
        current = alive.selectAll("circle").data(cells.alive);

      current
        .enter()
        .append("circle")
        .attr("r", radius)
        .merge(current)
        .style("fill", (d) => (d.isnew ? style.new : style.alive))
        .attr("cx", (d) => delta * d[0] - radius)
        .attr("cy", function (d) {
          return delta * d[1] - radius;
        });

      current.exit().remove();

      current = dead.selectAll("circle").data(cells.dead);

      current
        .enter()
        .append("circle")
        .attr("r", radius)
        .merge(current)
        .style("fill", style.dead)
        .style("opacity", 0.5)
        .attr("cx", function (d) {
          return delta * d[0] - radius;
        })
        .attr("cy", function (d) {
          return delta * d[1] - radius;
        })
        .transition()
        .duration(0.3 * speed)
        .style("opacity", 0)
        .each(function (d) {
          if (!squares.get(d)) {
            squares.set(d, d);
          }
        })
        .remove();

      if (stylet) this.styleTrail(state);
    }, speed);
  }

  draw(state) {
    const { d3, delta, Nx, Ny, width, height } = state;
    const paper = d3
      .select(this.paper)
      .append("svg")
      .classed("paper", true)
      .attr("width", width)
      .attr("height", height)
      .style("stroke", "#999")
      .style("stroke-width", 0.1);

    paper
      .append("g")
      .selectAll("line")
      .data(d3.range(Ny + 1))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", (d, i) => delta * i)
      .attr("x2", Nx * delta)
      .attr("y2", (d, i) => delta * i);

    paper
      .append("g")
      .selectAll("line")
      .data(d3.range(Nx + 1))
      .enter()
      .append("line")
      .attr("y1", 0)
      .attr("x1", (d, i) => delta * i)
      .attr("y2", Ny * delta)
      .attr("x2", (d, i) => delta * i);

    state.alive = paper.append("g").classed("alive", true).style("stroke", "none");
    state.dead = paper.append("g").classed("dead", true).style("stroke", "none");
    state.trail = paper.append("g").classed("trail", true).style("stroke", "none");
    this.styleTrail(state);
  }

  styleTrail(state) {
    const { delta, trail, squares } = state;
    trail
      .selectAll("rect")
      .data(Array.from(squares.values()))
      .enter()
      .append("rect")
      .attr("x", (d) => delta * (d[0] - 1))
      .attr("y", (d) => delta * (d[1] - 1))
      .attr("height", delta)
      .attr("width", delta)
      .style("fill", "#e31a1c")
      .style("fill-opacity", 0.1);
  }
}

const gameOfLife = (state) => {
  const { d3, Nx, Ny } = state;

  let cells = new Map(),
    life = 0;

  const cell_key = (cell) => `${cell[0]},${cell[1]}`;

  const reset = (data) => {
    cells.clear();
    data.forEach((d) => {
      const cell = [+d.i, +d.j];
      cells.set(cell_key(cell), cell);
    });
    life = 0;
  };

  const step = () => {
    var dead = [];

    if (life) {
      const alive = new Map(),
        born = new Map();

      cells.forEach((cell, key) => {
        const num = neighbours(cell, born);
        if (num > 1 && num < 4) {
          cell.isnew = false;
          alive.set(key, cell);
        } else {
          dead.push(cell);
        }
      });

      cells = alive;

      born.forEach((num, key) => {
        if (num === 3) {
          const d = key.split(",");
          const cell = [+d[0], +d[1]];
          cell.isnew = true;
          cells.set(key, cell);
        }
      });
    }
    life += 1;
    return { alive: Array.from(cells.values()), dead: dead };
  };

  const addRandom = (p) => {
    var n = Math.floor((p || 0.05) * Nx * Ny),
      i = d3.randomUniform(0, Nx - 1),
      j = d3.randomUniform(1, Ny),
      d;
    for (var k = 0; k < n; ++k) {
      d = [Math.floor(i()) + 1, Math.floor(j()) + 1];
      cells.set(d, d);
    }
  };

  const add = (cell, i, j, dead) => {
    i = cell[0] + i;
    j = cell[1] + j;
    i = i <= Nx ? (i > 0 ? i : Nx) : 1;
    j = j <= Ny ? (j > 0 ? j : Ny) : 1;
    const index = cell_key([i, j]);
    if (cells.get(index)) return 1;
    const idx = dead.get(index) || 0;
    dead.set(index, idx + 1);
    return 0;
  };

  const neighbours = (cell, dead) => {
    return (
      add(cell, -1, -1, dead) +
      add(cell, 0, -1, dead) +
      add(cell, 1, -1, dead) +
      add(cell, -1, 0, dead) +
      add(cell, 1, 0, dead) +
      add(cell, -1, 1, dead) +
      add(cell, 0, 1, dead) +
      add(cell, 1, 1, dead)
    );
  };

  return {
    reset: reset,
    step: step,
    addRandom: addRandom,
  };
};

customElements.define("game-of-life", GameOfLife);
