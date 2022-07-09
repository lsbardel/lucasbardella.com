<script>
  let a = 1;
  let b = 2;
</script>
<form class="pure-form pure-form-stacked">
  <fieldset>
    <label>
      <input type="number" bind:value={a} min="0" max="10" />
      <input type="range" bind:value={a} min="0" max="10" />
    </label>
    <label>
      <input type="number" bind:value={b} min="0" max="10" />
      <input type="range" bind:value={b} min="0" max="10" />
    </label>
  </fieldset>
</form>
<p>{a} + {b} = {a + b}</p>
