author: Luca Sbardella
title: The Witch of Agnesi
slug: the_witch_of_agnesi
date: 2014-05-16 14:50
keywords: d3, javascript, mathematics, math, agnesi
description: An example of d3.js to plot the witch of Agnesi. Move the mouse over the plot to see the animation. Inspired by google's doodle on the 16th of May 2014.
require_css: katex
image: http://upload.wikimedia.org/wikipedia/commons/5/57/Maria_Gaetana_Agnesi.jpg
category: visualization
---

<div id='agnesi'></div>


This example demonstrate how to plot the
<a href="http://en.wikipedia.org/wiki/Witch_of_Agnesi">witch of agnesi</a>
using [d3][] as explained by wikipedia.

The curve has Cartesian equation

<div data-katex>
  y = \frac{8 r^3}{x^2 + 4 r^2}
</div>


Code available <a href="$site_url$site_media/lucasbardella/lab/agnesi.js" target="_self">here</a>.


<script>
lux.require(['lucasbardella/lab/agnesi'], function (agnesi) {
    agnesi('#agnesi');
});
</script>
