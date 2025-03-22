import App from "./App.svelte";

export default (notebook, el) => {
  new App({ notebook, target: el });
};
