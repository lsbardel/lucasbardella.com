---
title: Planarity
date: 2014-05-01
description: Can you untangle the planar graphs? See if you can position the vertices so that no two lines cross.
keywords: game, planarity
private: true
---

```tsx
import {Planarity} from "../../components/planarity.js";
```

```tsx
display(<Planarity N={10} radius={15} aspectRatio="80%"/>);
```

```js
const N = view(Inputs.range([5, 20], {step: 1, label: "Number of vertices", value: 8}));
```

Idea taken from [Jason Davis](http://www.jasondavies.com/planarity/).
