author: Luca Sbardella
title: Game of Life
date: 2023-01-28
keywords: game, d3
description: The famous Conway's Game of Life!
category: visualization
hero_photo: unsplash-iWmfPbKmxEQ
hero_opacity: 0.6
image: unsplash-iWmfPbKmxEQ

---

<script type="module" src="{{ bundleUrl }}/lab/game-of-life/life.js"></script>

A web component animating with the famous [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life).

## Pulsar

This is my favourite pattern and the most common period-3 oscillator.

<game-of-life aspect-ratio="60%" pattern-url="{{ bundleUrl }}/lab/game-of-life/pulsar.csv" speed=500></game-of-life>

## Beacon

The most common period-2 oscillator.

<game-of-life aspect-ratio="40%" pattern-url="{{ bundleUrl }}/lab/game-of-life/beacon.csv" speed=500></game-of-life>

## Gosper

The "Gosper glider gun" produces a pattern that can grow indefinitely

<game-of-life aspect-ratio="60%" pattern-url="{{ bundleUrl }}/lab/game-of-life/gosper.csv" speed=200></game-of-life>


Code available [here]({{ bundleUrl }}/lab/game-of-life/life.js) or on [github](https://github.com/lsbardel/lucasbardella.com/blob/main/content/lab/game-of-life/life.js).
