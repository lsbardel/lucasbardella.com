author: Luca Sbardella
title: Pi Approximation
slug: pi
date: 2014 November 20
description: Pi appoximation up to 5 decimal places using Sobol low-discrepancy random number generator. D3JS has been used for the animation.
keywords: pi, animation, svg, d3js, giottojs
require_css: katex
image: ${assetUrl}/lab/pi.png
category: visualization
twitter_card: summary_large_image

---

<div class="container">
    <div class="row" data-ng-controller="GiottoCtrl">
        <div class="col-sm-12">
            <div class="center-block" style="max-width: 800px; width: 100%; position: relative">
                <div data-require="${assetUrl}/lab/pi.js" data-giotto-viz></div>
                <div style="position: absolute; top: 0; left: 0">
                    <p>&pi;: <span ng-bind="pi"></span></p>
                    <p>points: <span ng-bind="total"></span></p>
                </div>
                <div style="position: absolute; top: 0; right: 0">
                    <button class="btn btn-primary" ng-click="animate()" ng-bind="action" style="width: 80px"></button>
                </div>
            </div>
        </div>
    </div>
</div>

<br>

The simulation has been implemented using [GiottoJs](http://quantmind.github.io/giotto/)
javascript library which is built on top of [d3][].
Rendering using `svg` elements. Source code available here
<a href="${assetUrl}/lab/pi.js" target="_self">here</a>.
