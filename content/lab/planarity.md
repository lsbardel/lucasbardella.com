---
title: Planarity
date: 2014-05-01
description: Can you untangle the planar graphs? See if you can position the vertices so that no two lines cross.
keywords: game, planarity
---

```tsx
import Planarity from "../../components/planarity.js";
```


```js
const nodes = view(Inputs.range([5, 20], {step: 1, label: "Number of vertices", value: 8}));
const replay = view(Inputs.button("New graph"));
```

```tsx
display(<Planarity nodes={nodes} radius={10} replay={replay} aspectRatio="80%"/>);
```

The game only generates solvable graphs! These are known as [planar graphs](https://en.wikipedia.org/wiki/Planar_graph).

Idea taken from [Jason Davis](http://www.jasondavies.com/planarity/).
