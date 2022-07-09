title: Svelte integration
description: @metablock/cli can compile svelte applications for a rich blogging experience
author: Luca
date: 2 July 2020
js_source: main.js
stylesheet: https://unpkg.com/purecss@2.1/build/pure-min.css

---

<script src="{{ bundleUrl }}/lab/svelte/compiled.main.js" aspectratio="50%"></script>

In this notebook I experiment with a new integration based on the [svelte](https://svelte.dev/) framework.

* Add `js_source` to the fields in the `index.md` file so that it triggers the compilation
* This example uses the minimalist [purecss](https://purecss.io/) for styling
