<script>
  import { onMount } from "svelte";
  import planarity from "./planarity";
  let nodes = 8;
  let restarts = 0;
  let moves = 0;
  let time = 0;
  let crosses = 0;
  let game;

  function update(state) {
    moves = state.moves;
    time = state.time;
    crosses = state.crosses;
  }

  function restart() {
    restarts += 1;
    planarity(game, { nodes, update, restart: true });
  }

  onMount(() => {
    planarity(game, { nodes, update });
  });
</script>

<style>
  .full-height {
    height: 100%;
  }
  .control {
    height: 10%;
  }
  .game {
    height: 90%;
    position: relative;
  }
  .board {
    float: left;
  }
  .main {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>

<div class="pure-g full-height">
  <div class="pure-u-1">
    <label>
      <input type="number" bind:value={nodes} min="4" max="20" />
      <input type="range" bind:value={nodes} min="4" max="20" />
    </label>
    <buttom class="pure-button pure-button-primary" on:click={restart}>
      Restart
    </buttom>
  </div>
  <div class="pure-u-1 game">
    <div class="board">
      <p>Moves: {moves}</p>
      <p>Crosses: {crosses}</p>
      <p>
        Time:
        <code>{time}</code>
        seconds
      </p>
    </div>
    <div class="full-height main" bind:this={game} />
  </div>
</div>
