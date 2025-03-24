import * as d3 from "npm:d3";
import * as React from "npm:react";

type GameOfLifeInput = {
  speed: number;
  delta: number;
  pattern: {i: number, j: number}[];
  aspectRatio: string;
  theme?: string;
};

type Theme = {
  new: string;
  alive: string;
  dead: string;
};

type GameOfLifeState = {
  speed: number;
  delta: number;
  style: Theme;
  width: number;
  height: number;
  Nx: number;
  Ny: number;
  squares: Map<any, any>;
};

type GameOfLifeCells = {
  alive: any;
  dead: any;
  trail: any;
};

const styles = {
    dark: {
      new: "#1d91c0",
      alive: "#fff",
      dead: "#e31a1c",
    },
    light: {
      new: "#1d91c0",
      alive: "#333",
      dead: "#e31a1c",
    }
};

// A cell in the grid
class Cell {
  isnew: boolean;
  i: number;
  j: number;

  constructor(i: number, j: number) {
    this.isnew = false;
    this.i = i;
    this.j = j;
  }

  get key() {
    return `${this.i},${this.j}`;
  }

  static fromKey(key: string) {
    const d = key.split(",");
    return new Cell(+d[0], +d[1]);
  }
}


const GameOfLife = ({speed, delta, theme, aspectRatio, pattern}: GameOfLifeInput) => {
  const paper = React.useRef(null);
  const style = {width: "100%", position: "relative", paddingTop: aspectRatio};
  const styleInner = {position: "absolute", top: 0, left: 0, bottom: 0, right: 0};

  React.useEffect(() => {
    const width = paper.current.offsetWidth;
    const height = paper.current.offsetHeight;
    const state = {
      speed,
      delta: delta || 10,
      style: styles[theme || "dark"],
      width,
      height,
      squares: new Map(),
      Ny: Math.floor(height / delta),
      Nx: Math.floor(width / delta),
    };
    const timer = animateLife(paper.current, state, pattern);

    return () => {
      timer.stop();
    };
  });

  return (
    <div className="gol-container-outer" style={style}>
      <div className="gol-container" ref={paper} style={styleInner}>
      </div>
    </div>
  );
};

export default GameOfLife;


const animateLife = (paper, state: GameOfLifeState, pattern: {i: number, j: number}[]) => {
    const step = gameOfLife(state, pattern);
    const cells = draw(paper, state);

    return d3.interval(() => {
      const  { alive, dead } = step();
      const radius = state.delta / 2;

      let stylet = false,
        current = cells.alive.selectAll("circle").data(alive);

      current
        .enter()
        .append("circle")
        .attr("r", radius)
        .merge(current)
        .style("fill", (d) => (d.isnew ? state.style.new : state.style.alive))
        .attr("cx", (d: Cell) => state.delta * d.i - radius)
        .attr("cy", (d: Cell) => state.delta * d.j - radius);

      current.exit().remove();

      current = cells.dead.selectAll("circle").data(dead);

      current
        .enter()
        .append("circle")
        .attr("r", radius)
        .merge(current)
        .style("fill", state.style.dead)
        .style("opacity", 0.5)
        .attr("cx", (d: Cell) => state.delta * d.i - radius)
        .attr("cy", (d: Cell) => state.delta * d.j - radius)
        .transition()
        .duration(0.3 * state.speed)
        .style("opacity", 0)
        .each((d: Cell) => {
          if (!state.squares.get(d.key)) {
            state.squares.set(d.key, d);
          }
        })
        .remove();

      if (stylet) styleTrail(state, cells);
    }, state.speed);
}

const draw = (el, state: GameOfLifeState) => {
  const paper = d3
    .select(el)
    .append("svg")
    .classed("paper", true)
    .attr("width", state.width)
    .attr("height", state.height)
    .style("stroke", "#999")
    .style("stroke-width", 0.1);

  paper
    .append("g")
    .selectAll("line")
    .data(d3.range(state.Ny + 1))
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("y1", (d, i) => state.delta * i)
    .attr("x2", state.Nx * state.delta)
    .attr("y2", (d, i) => state.delta * i);

  paper
    .append("g")
    .selectAll("line")
    .data(d3.range(state.Nx + 1))
    .enter()
    .append("line")
    .attr("y1", 0)
    .attr("x1", (d, i) => state.delta * i)
    .attr("y2", state.Ny * state.delta)
    .attr("x2", (d, i) => state.delta * i);

  const cells = {
    alive: paper.append("g").classed("alive", true).style("stroke", "none"),
    dead: paper.append("g").classed("dead", true).style("stroke", "none"),
    trail: paper.append("g").classed("trail", true).style("stroke", "none"),
  };
  styleTrail(state, cells);
  return cells;
};

const styleTrail = (state: GameOfLifeState, cells: GameOfLifeCells) => {
  const { delta, squares } = state;
  cells.trail
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
};

const gameOfLife = (state: GameOfLifeState, pattern: {i: number, j: number}[]) => {
  const { Nx, Ny } = state;

  let cells = new Map(),
    life = 0;

  pattern.forEach((d) => {
    const cell = new Cell(+d.i, +d.j);
    cells.set(cell.key, cell);
  });

  const step = () => {
    const dead = [];

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
          const cell = Cell.fromKey(key);
          cell.isnew = true;
          cells.set(cell.key, cell);
        }
      });
    }
    life += 1;
    return { alive: Array.from(cells.values()), dead };
  };

  const add = (cell: Cell, i: number, j: number, dead: Map<string, number>) => {
    i = cell.i + i;
    j = cell.j + j;
    i = i <= Nx ? (i > 0 ? i : Nx) : 1;
    j = j <= Ny ? (j > 0 ? j : Ny) : 1;
    const nc = new Cell(i, j);
    if (cells.get(nc.key)) return 1;
    const idx = dead.get(nc.key) || 0;
    dead.set(nc.key, idx + 1);
    return 0;
  };

  const neighbours = (cell: Cell, dead: Map<string, number>) => {
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

  return step;
};
