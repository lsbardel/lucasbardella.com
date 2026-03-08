---
title: The Witch of Agnesi
description: An interactive geometric construction of the Witch of Agnesi curve. Move the mouse over the plot to animate.
date: 2014-05-16
keywords: d3, mathematics, agnesi, geometry
toc: false
---

```tsx
import Agnesi from "../../components/agnesi.js";
```

An interactive demonstration of the [Witch of Agnesi](https://en.wikipedia.org/wiki/Witch_of_Agnesi),
inspired by Google's doodle of 16 May 2014. Move the mouse over the plot to animate the construction.

The curve has the Cartesian equation:

```tex
y = \frac{8 r^3}{x^2 + 4 r^2}
```

```tsx
display(<Agnesi />);
```
