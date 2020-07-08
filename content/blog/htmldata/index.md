author: Luca Sbardella
title: How the HTML data attribute works
slug: how_the_html_data_works
date: 2014-05-17 22:31
head-tag: html5, javascript, data, d3, jquery, dom
image: {{ assetUrl }}/blog/html5.png
description: HTML5 custom data attribute is useful, how is it used and why.
category: HTML5

---

<img width=300 src="{{ assetUrl }}/blog/html5.png" alt="HTML custom data attribute" style="float: right; padding-left: 20px">

The HTML custom data attribute `data-*` has become one of the most important parts in modern
front-end development, especially since [HTML5][] has become the de-facto
standard mark-up language for the world wide web.
This attribute is extremely useful because it allows one to inject custom data values
directly into the [DOM](http://en.wikipedia.org/wiki/Document_Object_Model) tree.

It is intended for use by the site's own scripts, for example:

```html
<div class="user" data-username="pippo" data-email="pippo@pippo.com"></div>
```

Before this important change in the mark-up language, developers could not add
data to the DOM in a clean and elegant way. Instead they were forced to use all
sorts of hacks and tricks to get the job done.

## Specification

Each custom `data-*` attribute is valid if the `name` replacing the `*` follows
these rules:

- it must not start with `xml`, whatever case
- it must not contain any semicolon
- it must not contain spaces

These attributes are converted into a dictionary like container of
`String` key and `String` value
pairs called the [DOMStringMap](https://developer.mozilla.org/en/docs/Web/API/DOMStringMap).
The conversion follows these rules:

- any dash (U+002D) in the `name` is removed
- any letter following a dash, before its removal, is set in its upper case counterpart

In other words, the `data-date-of-birth` attribute becomes the
`dateOfBirth` key in the data container.

I'm not sure why the decision to change the attribute names to their
[camel-cased](http://en.wikipedia.org/wiki/CamelCase) versions was taken,
I'm not sure it is the right decision, but it is a decision
we can live with.

Another important fact to notice is that you don't need to set a data attribute to a given value,
instead you can simply add the attribute to the element:

```html
<div id="test" data-an-empty-name></div>
```

The value associated with the above data attribute is an empty string:

<div id="test" data-an-empty-name></div>

```javascript
const el = document.getElementById("test");
const data = JSON.stringify(el.dataset, null, 2);
el.appendChild(document.createTextNode(data));
```

## Javascript plugins

Several JavaScript library/plugins use the custom data attribute to activate
their API and to obtain configuration options.
For example, the popular [bootstrap][] library can
be used through the markup API without writing a single line of JavaScript.

By setting:

```html
<div id="carousel1" class="carousel slide" data-ride="carousel">
  ...
</div>
```

A carousel is activated.

<div style="width: 100%; position: relative; overflow: hidden; padding-top: 80%">
<iframe src="{{ bundleUrl }}/blog/how_the_html_data_works/carousel.html" title="Bootstrap carousel"
style="position: absolute; width: 100%; height: 100%; bottom: 0; top: 0; right: 0; left: 0; border: 0"></iframe>
</div>

## Data driven documents

Another important use of the data attribute is with JavaScript libraries such as [d3](https://d3js.org/):

> D3.js is a JavaScript library for manipulating documents based on data. D3 helps you bring data to life using HTML, SVG and CSS. D3’s emphasis on web standards gives you the full capabilities of modern browsers without tying yourself to a proprietary framework, combining powerful visualization components and a data-driven approach to DOM manipulation.
>
> d3js.org

Lets take this example:

```html
<div id="barchart" data-values="[45, 63, 7]"></div>
```

<div id='barchart' data-values='[60, 140, 25]'></div>

The following script generates the bar chart above:

```javascript
notebook.require("d3-selection").then((d3) => {
  const chart = d3
      .select("#barchart")
      .style("text-align", "right")
      .style("color", "#fff"),
    data = JSON.parse(chart.node().dataset.values);

  chart
    .selectAll("div")
    .data(data)
    .enter()
    .append("div")
    .style("width", (d) => `${d}px`)
    .style("background", "#007d1c")
    .style("margin", "1px")
    .style("padding", "3px")
    .text((d) => d);
});
```

And that is all.
