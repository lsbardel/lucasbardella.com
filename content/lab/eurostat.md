---
title: Eurostat data loaders
description: Eurostat data loaders for easy access to European statistics datasets
theme: dashboard
keywords: eurostat, data loader, statistics, europe, parquet
date: 2025-06-22
---

The [Eurostat data browser](https://ec.europa.eu/eurostat/databrowser/explore/all/all_themes) is a great sources for all european statistics. But it is sometimes a bit difficult to use. This page loads its XML catalog and converts it to an easier csv format.

This page has been taken from [Fil/pangea](https://github.com/Fil/pangea) and slightly adapted to work with my Observable setup. All credits to [Fil](https://github.com/Fil).

```js
const dataUrl = (code) =>
  `https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/${code}/?format=SDMX-CSV&compressed=true&i`;
const htmlUrl = (code) => `https://ec.europa.eu/eurostat/databrowser/view/${code}/default/table`;
const search = view(Inputs.search(catalogue));
```

```js
const row = view(
  Inputs.table(search, {
    multiple: false,
    format: {
      code: (v) => html`<a href="${htmlUrl(v)}" target="_blank">${v}</a>`,
    },
  }),
);
```

```js
const code = row?.code;

if (code) {
  const href = dataUrl(code);
  const viewUrl = htmlUrl(code);
  const data = Object.entries(row);
  data.push({ 0: "url", 1: href });
  display(
    Inputs.table(data, {
      header: { 0: "", 1: "" },
      width: { 0: 120, 1: 500 },
      format: {
        1: (v) => {
          if (v === code) return html`<a href="${viewUrl}" target="_blank">${code}</a>`;
          else if (v === href) return html`<a href="${href}" target="_blank">download</a>`;
          else return v;
        },
      },
    }),
  );
}
```

```js
const catalogue = FileAttachment("/data/eurostat/catalogue.csv")
  .csv()
  .then(
    (data) => (
      data.forEach((row) => {
        row.lastUpdate = new Date(row.lastUpdate);
        row.lastModified = new Date(row.lastModified);
        row.count = +row.count;
      }),
      data
    ),
  );
```
