title: Svelte integration
description: @metablock/cli can compile svelte applications for a rich blogging experience
author: Luca
date: 2 July 2020
js_source: main.js
stylesheet: https://unpkg.com/purecss@2.1/build/pure-min.css
image: {{ bundleUrl }}/lab/svelte/svelte.png
hero_photo: _Ya__WUgeUg

---

<module-component src="{{ bundleUrl }}/lab/svelte/compiled.main.js"></module-component>

In this notebook I experiment with a new integration based on the [svelte](https://svelte.dev/) framework.

### TL;DR

* Add `js_source` to the fields in the `index.md` file so that it triggers the compilation (check this [notebook fields]({{ bundleUrl }}/lab/svelte.json))
* This example uses the minimalist [purecss](https://purecss.io/) for styling
