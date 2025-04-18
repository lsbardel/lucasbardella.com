---
title: Country Risk Statistics
description: Country risk statistics visualization using Observable plot - data from financial modelling prep.
date: 2025-04-18
keywords: plot, risk, economy
theme: dashboard
---

```js
const stats = FileAttachment("../../data/country-stats.csv").csv({typed: true});
const countries = fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(response => response.json());
```

```tsx
import {CountryStats} from "../../components/country-risk.js";
```



```tsx
display(<CountryStats countries={countries} stats={stats} aspectRatio="70%"/>);
```
