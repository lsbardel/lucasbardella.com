author: Luca Sbardella
title: Largest Area in Histogram
date: 2020-08-05
keywords: algorithms, histogram, stack
description: Given n non-negative integers representing the histogram's bar height where the width of each bar is 1, find the area of largest rectangle in the histogram
image: {{ assetUrl }}/lab/histogram.png
hero_photo: unsplash-h3kuhYUCE9A
hero_opacity: 0.1
category: visualization

---

<module-component src="{{ bundleUrl }}/lab/largest-area-in-histogram/histogram.js" aspectratio="70%"></module-component>

This is a visualization of the maximum rectangular area in a histogram. It is the solution of the following problem

> Given n non-negative integers representing the histogram's bar height where the width of each bar is 1, find the area of largest rectangle in the histogram.

To solve the problem in `math:O(N)` one can use a [stack data type](https://en.wikipedia.org/wiki/Stack_(abstract_data_type)):

```js
const largestRectangle = (Height) => {
  var stack = [],
    max_area = 0,
    area,
    x1,
    x2,
    y;

  Height.map((h, i) => {
    while (stack.length && h < Height[stack[stack.length - 1]]) calc_area(i);
    stack.push(i);
  });

  while (stack.length) calc_area(Height.length);

  return [x1, x2, y];

  function calc_area(i) {
    var j = stack.splice(stack.length - 1);
    var t = stack.length ? stack[stack.length - 1] + 1 : 0;
    area = Height[j] * (i - t);
    if (area > max_area) {
      max_area = area;
      y = Height[j];
      x1 = t;
      x2 = i;
    }
  }
};
```
