title: Github Web Component
date: 2023-01-15
author: Luca Sbardella
slug: embedding-github-content
description: Github has a rich and powerful API that allows you to access all the content hosted on the platform. This post will explore how to embed these content types on your website using web components.
image: unsplash-4hbJ-eymZ1o
hero_photo: unsplash-4hbJ-eymZ1o
hero_photo_filter: 0.8
hero_dark: true
head-tag: github, web
category: git

---

[Web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) are a powerful tool for creating reusable, customizable, and composable user interface elements. They provide a way for developers to create custom elements that can be used in any web page or application, regardless of the framework or library being used. This allows for a more modular and maintainable codebase, as well as improved performance and user experience.

In this blog post, I'll dive into the basics of web components and explore how they can be used to build efficient and effective user interfaces. From setting up your first web component to incorporating them into your project, we'll cover everything you need to know to get started. So, let's get started!

## A simple web component

Here is a simple example of a web component that displays a message:

```html
<template id="greeting-template">
  <div>
    <p style="background-color: #333">Hello, <slot></slot>!</p>
  </div>
</template>

<script>
class Greeting extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const template = document.getElementById('greeting-template');
    if (template) {
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }
}
customElements.define('greeting-component', Greeting);
</script>
```

This component uses the `<template>` tag to define the structure of the component and the `<slot>` tag to specify where the content passed to the component should be inserted.
Subsequently, The component is defined as a class that extends the [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) class and attaches a shadow root to the element.
The shadow root isolates the styles and elements of the component from the rest of the document.

You can use this component in your HTML like this:

```html
<greeting-component>World</greeting-component>
```

And this is the result:

<template id="greeting-template">
  <div>
    <p style="background-color: #333">Hello, <slot></slot>!</p>
  </div>
</template>
<script type="module" src="{{ bundleUrl }}/blog/embedding-github-content/hello.js" async></script>
<greeting-component>World</greeting-component>

Not that exciting, but it's a start!

## Styling web components

Here is an example of a web component that animates a square moving from left to right, no template this time, just plain javascript with embedded CSS:

```js
<script>
class AnimatedSquare extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .animated-square {
          width: 50px;
          height: 50px;
          background-color: red;
          position: relative;
          animation: move-square 1s linear infinite;
        }
        @keyframes move-square {
          from { left: 0px; }
          to { left: 100%; }
        }
      </style>
      <div class="animated-square"></div>
    `;
  }
}
customElements.define('animated-square', AnimatedSquare);
</script>
```
<script type="module" src="{{ bundleUrl }}/blog/embedding-github-content/square.js" async></script>
This component can be used in an HTML file by simply adding the tag

```html
<animated-square>
```

to the desired location. And here it is
<animated-square>

This is far more interesting but quite useless. Let's get to the main point of this post: embedding github content.

## Embedding github content

Github has a rich and powerful API that allows you to access all the content hosted on the platform. This includes code snippets, files, and gists. Here we write a simple web component that fetches a file from a github repository and displays it in the browser with syntax highlighting.

```js
<script type="module" src="{{ bundleUrl }}/blog/embedding-github-content/github.js" async></script>
<github-content owner="lsbardel" repo="lucasbardella.com" path="app/notebook/github.ts"></github-content>
```

An this is the result:

<script type="module" src="{{ bundleUrl }}/blog/embedding-github-content/github.js" async></script>

<github-content owner="lsbardel" repo="lucasbardella.com" path="content/blog/embedding-github-content/github.js"></github-content>
