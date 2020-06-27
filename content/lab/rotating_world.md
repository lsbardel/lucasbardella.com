title: Rotating world
author: Luca Sbardella
description: Rendering performance when using canvas or svg for a rotating world animation
date: 2014 October 30
image: ${assetUrl}/lab/rotating-world.png
category: map
require_js: lucasbardella/lab/rotating-world
twitter_card: summary_large_image

---

<div class="container-fluid">
<div class="row">
<div class="col-sm-9 push-bottom">
    <div class="lazyContainer">
        <div style='padding-top: 80%'></div>
        <div data-options="lux.context.rotatingWorld" data-height='80%' class="content" data-giotto-rotatingworld></div>
    </div>
</div>
<div class="col-sm-3 push-bottom">
    <div style="font-size: 12px; max-width: 200px;">
    $html_worldform
    <div data-jstats></div>
    <p>Milliseconds needed to render a frame. The lower the number the better.</p>
    </div>
</div>
</div>
</div>
<br>

A comparison in rendering performance when using [d3][] with
[canvas](http://en.wikipedia.org/wiki/Canvas_element) or [svg](http://en.wikipedia.org/wiki/Scalable_Vector_Graphics).
On this dataset, the canvas element requires about 20 millisecond to render one
frame while the svg element about 30.
Source code requires the [d3ext][] javascript library and it is available
<a href="${assetUrl}/lab/rotating-world.js" target="_self">here</a>.
