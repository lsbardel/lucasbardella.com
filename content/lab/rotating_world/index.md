title: Rotating world
author: Luca Sbardella
description: Rendering performance when using canvas or svg for a rotating world animation
date: 2014 October 30
image: {{ assetUrl }}/lab/rotating-world.png
category: map, d3
twitter_card: summary_large_image
hero_photo: rkFIIE9PxH0
hero_opacity: 0.2

---

<module-component src="{{ bundleUrl }}/lab/rotating_world/code.js"
  geometry="{{ assetUrl }}/lab/world-topo.json"
  aspectratio="70%">
</module-component>

A comparison in rendering performance when using [d3](https://d3js.org/) with
[canvas](http://en.wikipedia.org/wiki/Canvas_element) or [svg](http://en.wikipedia.org/wiki/Scalable_Vector_Graphics).
On this dataset, the canvas element requires about 20 millisecond to render one
frame while the svg element about 30.
Source code is available [here]({{ bundleUrl }}/lab/rotating_world/code.js").
