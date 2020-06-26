author: Luca Sbardella
title: Planarity
slug: planarity
date: 2014-05-01 14:26
description: Can you untangle the planar graphs? See if you can position the vertices so that no two lines cross.
image: $site_media/lucasbardella/lab/planarity.svg
category: game


<div class="row">
<div class="col-sm-3">
    <div class="well">
        <p>Crossings <strong><span id="count"></span></strong></p>
        <p><span id="move-count">0 moves</span> in <span id="timer">0</span> s</p>
        <form class="form" role="form">
            <div class="form-group">
                <label class="sr-only" for="nodes">Vertices</label>
                <input class="form-control" id="nodes" type="number" min="4" max="99" value="8" placeholder="Vertices" required>
            </div>
            <button id="generate" type="submit" class="btn btn-default">new</button>
        </form>
    </div>
</div>
<div class="col-sm-9">
    <div id="planarity"></div>
</div>
</div>

Idea taken from [Jason Davis](http://www.jasondavies.com/planarity/),
code available
<a href="$site_url$site_media/lucasbardella/lab/planarity.js" target="_self">here</a>.


<script type="text/javascript">
lux.require(['jquery', 'd3', 'lucasbardella/lab/planarity'], function ($, d3, Planarity) {
    var timer = $('#timer'),
        moveCounter = $('#move-count'),
        cross = $('#count'),
        format = d3.format(",.1f"),
        p = new Planarity('#planarity');

    d3.timer(function() {
        if (p.count) timer.text(format((+new Date - p.started) / 1000));
        moveCounter.text(p.moves + " move" + (p.moves !== 1 ? "s" : ""));
        cross.text(p.count + '');
    });

    $("#generate").on("click", function (e) {
        e.preventDefault();
        p.nodes = parseInt($('#nodes').val(), 10);
        p.start();
    });
    p.start();
});
</script>
