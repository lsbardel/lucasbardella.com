---
title: Game of Life
date: 2023-01-28
keywords: game, d3
description: The famous Conway's Game of Life!
private: true
---

```tsx
import GameOfLife from "../../components/life.js";
const pulsar = FileAttachment(`../../data/game-of-life/pulsar.csv`).csv({typed: true});
const beacon = FileAttachment(`../../data/game-of-life/beacon.csv`).csv({typed: true});
const gosper = FileAttachment(`../../data/game-of-life/gosper.csv`).csv({typed: true});
```

A web component animating with the famous [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life).

## Pulsar

This is my favourite pattern and the most common period-3 oscillator.

```tsx
display(<GameOfLife aspectRatio="60%" pattern={pulsar} speed={500}/>);
```

## Beacon

The most common period-2 oscillator.

```tsx
display(<GameOfLife aspectRatio="40%" pattern={gosper} speed={500}/>);
```

## Gosper

The "Gosper glider gun" produces a pattern that can grow indefinitely

```tsx
display(<GameOfLife aspectRatio="60%" pattern={gosper} speed={200}/>);
```
