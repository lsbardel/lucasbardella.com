---
title: Sparkling Wines of the World
description: A visualization of the main sparkling wines of the world. Created while preparing for Unit 5 WSET diploma exam.
date: 2014-06-07
keywords: d3, wine, visualization, circle packing
toc: false
---

```js
const data = FileAttachment("../../data/sparkling.csv").csv({typed: true});
```

The area of each circle is proportional to the number of bottles produced in a year (data from 2012).

Click any circle to zoom in, click the background to zoom out.

```tsx
import Sparkling from "../../components/sparkling.js";
display(<Sparkling data={data} />);
```
