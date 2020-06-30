title: Sparkling Wines of the World
slug: sparkling_wines_of_the_world
author: Luca Sbardella
date: 2014-06-07 17:25
description: A visualization af the main sparkling wines of the world. Created while preparing for Unit 5 WSET diploma exam.
image: ${assetUrl}/lab/sparkling.jpg
category: visualization

---

<div class="container-fluid">
    <div class="row">
        <div id='sparkling' class="col-sm-12"></div>
    </div>
    <div class="row">
        <div class="col-sm-12">
        The area of each circle is proportional to the number of bottles produced in a year (data from 2012).
        <p>Visualization made using <a href="http://d3js.org/" target="_blank">d3.js</a> and inspired by <a href="http://bl.ocks.org/mbostock/7607535">zoomable circle packing</a>.
        The data is stored in this <a href="https://docs.google.com/a/quantmind.com/spreadsheets/d/1hkbKPv2zCqeXDzQwXOPyi77I0y5whGTyo4M-nwR6t_w/pubhtml" target="_blank">google spreadsheet</a></p>
        </div>
    </div>
</div>

<script type='text/javascript'>
lux.require(['lucasbardella/lab/wine'], function (wine) {
    wine('#sparkling',
         {key: '1hkbKPv2zCqeXDzQwXOPyi77I0y5whGTyo4M-nwR6t_w'});
    //https://docs.google.com/spreadsheets/d/1hkbKPv2zCqeXDzQwXOPyi77I0y5whGTyo4M-nwR6t_w/pubhtml
    //1yDHM8TB051KPGvwsh33dFsBS9p66z6CeRG2_MTvjlok
});
</script>
