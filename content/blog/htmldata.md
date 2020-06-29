author: Luca Sbardella
title: How the HTML data attribute works
slug: how_the_html_data_works
date: 2014-05-17 22:31
require_js: bootstrap
head-tag: html5, javascript, data, d3, jquery, dom
image: \${assetUrl}/blog/html5.png
description: HTML5 custom data attribute is useful, how is it used and why.
category: HTML5

---

<img width=300 src="${assetUrl}/blog/html5.png" alt="HTML custom data attribute" style="float: right; padding-left: 20px">

The HTML custom data attribute `data-*` has become one of the most important parts in modern
front-end development, especially since [HTML5][] has become the de-facto
standard mark-up language for the world wide web.
This attribute is extremely useful because it allows one to inject custom data values
directly into the [DOM](http://en.wikipedia.org/wiki/Document_Object_Model) tree.

It is intended for use by the site's own scripts, for example:

```html
<div class="user" data-username="pippo" data-email="pippo@pippo.com"></div>
```

And using [jQuery][]:

```js
elems = $('.user').each(function () {
    var user = $(this).data();
    // user.username = 'pippo'
    // user.email = 'pippo@pippo.com'
    ...
});
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

```js
var data = $("#id").data();
// data.anEmptyName = ''
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

<div id="carousel1" class="carousel slide" data-ride="carousel" style="width: 400px;">
  <!-- Indicators -->
  <ol class="carousel-indicators">
    <li data-target="#carousel1" data-slide-to="0" class="active"></li>
    <li data-target="#carousel1" data-slide-to="1"></li>
    <li data-target="#carousel1" data-slide-to="2"></li>
  </ol>

  <!-- Wrapper for slides -->
  <div class="carousel-inner">
    <div class="item active">
      <img src="https://farm9.staticflickr.com/8397/8627811896_c7ef225339_z_d.jpg" alt="Slide 1">
    </div>
    <div class="item">
      <img src="https://farm9.staticflickr.com/8534/8626702231_6297e7d414_z_d.jpg" alt="Slide 2">
    </div>
    <div class="item">
      <img src="https://farm9.staticflickr.com/8522/8626695311_7350f7583e_z_d.jpg" alt="Slide 3">
    </div>
  </div>

  <!-- Controls -->
  <a class="left carousel-control" href="#carousel1" data-slide="prev">
    <span class="glyphicon glyphicon-chevron-left"></span>
  </a>
  <a class="right carousel-control" href="#carousel1" data-slide="next">
    <span class="glyphicon glyphicon-chevron-right"></span>
  </a>
</div>

## Data driven documents

Another important use of the data attribute is with JavaScript libraries such as [d3][]:

> D3.js is a JavaScript library for manipulating documents based on data. D3 helps you bring data to life using HTML, SVG and CSS. D3’s emphasis on web standards gives you the full capabilities of modern browsers without tying yourself to a proprietary framework, combining powerful visualization components and a data-driven approach to DOM manipulation.
>
> d3js.org

Lets take this example:

```html
<div id="barchart" data-values="[45, 63, 7]"></div>
```

The following script generates the bar chart below:

```js
var chart = d3.select("#barchart"),
  data = JSON.parse(chart[0][0].dataset.values);
var bar = chart.selectAll("div");
bar
  .data(data)
  .enter()
  .append("div")
  .style("width", function (d) {
    return d + "px";
  });
```

<div id='barchart' data-values='[60, 140, 25]'></div>

<script type='text/javascript'>
require(['d3'], function (d3) {
    var chart = d3.select('#barchart').style('text-align', 'right').style('color', '#fff'),
        data = JSON.parse(chart[0][0].dataset.values);
    var bar = chart.selectAll('div');
    bar.data(data).enter().append('div')
    .style("width", function(d) { return d + "px"; })
    .style("background", "#007d1c")
    .style("margin", "1px")
    .style("padding", "3px")
    .text(function(d) { return d; });
});
</script>
</script>

And that is all.
