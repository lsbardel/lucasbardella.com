<script>
  import { onMount } from "svelte";
  import pi from "./pi";
  let points = 0;
  let restarts = 0;
  let pival = 0;
  let game;

  if (pi.anim) update(pi.anim);

  function update(anim) {
    points = anim.nodes.length;
    pival = anim.pi;
  }

  function restart() {
    restarts += 1;
    pi.draw(game, { update, restart: true });
  }

  onMount(() => {
    pi.draw(game, { update });
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
    <buttom class="pure-button pure-button-primary" on:click={restart}>
      Restart
    </buttom>
  </div>
  <div class="pure-u-1 game">
    <div class="board">
      <p>π: {pival}</p>
      <p>Points: {points}</p>
    </div>
    <div class="full-height main" bind:this={game} />
  </div>
</div>
