---
title: Observable to Astro
description: What Observable Framework did well, the React dependency problem that pushed this site to Astro, and what the move actually changed in practice.
date: 2026-09-12
keywords: observable framework, astro, site migration, react islands, static site generator, npm resolution, bundle size, ai agents
toc: true
heroImage: astro
heroTextColor: "#ffc34d"
---

This site ran on [Observable Framework](https://observablehq.com/framework/) for several years, and it was a good fit. It now runs on [Astro](https://astro.build). This post covers what Observable Framework did well, the one problem that made me move, and what the move involved.

## What Observable Framework Did Well

- **Markdown with live code.** A page is a markdown file with code cells in it. For technical posts that mix prose, maths and charts, this is a very pleasant way to write.
- **A reactive runtime.** Cells re-run when the values they depend on change. An input slider feeds a chart with no event handlers or state management to write.
- **Data loaders.** A Python or TypeScript script next to the content produces a data file. The framework ran it when a page asked for that file and cached the result.
- **No dependency tree.** `npm:` imports are resolved through a CDN, so there is no `node_modules` to install or maintain for a content site.
- **Layout for free.** A `pages` array in the config gives you a sidebar, a theme and a footer.

None of these were a reason to leave. The reactive runtime in particular is genuinely good.

## Why I Moved Away

The trigger was small. The market heatmap page needed a searchable dropdown, because the list of markets had grown past two hundred entries and a plain `select` was no longer usable. I tried the usual React libraries for this, and every one of them broke the page.

The cause is the CDN resolution that made the "no dependency tree" point above so convenient. When a library declares React as a peer dependency, the CDN resolves that range on its own and picks a version of React for the library. The page already runs its own React, and nothing merges the two. In ES modules a module is identified by its URL, so two URLs mean two separate copies of React.

I tried `react-select`, `downshift`, `@tanstack/react-virtual` and `@headlessui/react`. React hooks only work when the component and the renderer share the same copy of React, so every one of them failed with an [Invalid hook call](https://react.dev/warnings/invalid-hook-call-warning) error.

A bundler would have merged the copies into one, but this pipeline has no such step, no lockfile and no way to force a version. In practice that rules out React component libraries entirely, and that is a design choice, not a bug that will get fixed. It was the only reason for the move.

## What the Move Changed

- **Prose pages** were copied across. The frontmatter was already compatible with Astro content collections.
- **Components** needed their imports changed from `npm:react` to `react`. The component code itself stayed the same.
- **Reactive pages** were the real work, since Astro has no equivalent of the reactive runtime. The controls and their state now live in a small React wrapper around the existing component.
- **Data loaders** kept their scripts. Astro does not run them, so a small build script replaces that part, and `make data` runs every loader before the build.
- **Large data** for the interactive CFD post is shipped as a zip and read in the browser with [fflate](https://github.com/101arrowz/fflate), loading only the case being viewed.
- **The layout** had to be built, because Astro ships no sidebar. The new sidebar is plain HTML using native `details` elements.
- **The dropdown** that started all this ended up hand written, in about 150 lines. It is controlled, so browser history keeps working, and it uses the site styles directly.

## What It Weighs Now

A side effect of Astro's islands model is that a page only ships JavaScript for its interactive parts:

| Page | HTML | JavaScript |
|---|---|---|
| Prose with maths | 28 KB | none |
| Mandelbrot set | 8 KB | 13 KB |
| CFD cavity | 24 KB | 52 KB |

Prose pages ship no JavaScript at all. KaTeX renders the maths at build time and the sidebar needs no script.

## AI Agents Make Frameworks Less Important

A big part of what an opinionated framework offers is the boilerplate it saves you from writing: the sidebar, the layout, the wiring between inputs and charts. With AI agents, most of that boilerplate can be written for you. The sidebar, the reactive wrappers and the dropdown on this site are exactly that kind of code.

That shifts what matters in a framework. Convenience counts for less, and staying out of the way counts for more. Astro is very lightweight. It does not get in the way of styling, and it does not get in the way of dependencies, since packages are installed and bundled the normal way. That makes it a very good fit for building a website together with an AI agent: the agent writes plain components, CSS and imports, with no framework conventions to work around.

## Conclusion

If you run Observable Framework and it works for you, stay. The writing experience and the reactive runtime are excellent.

Move if you need React component libraries, because the way Observable resolves npm packages makes them unusable and that will not change. For this site, the move was mostly mechanical. The two pieces of real work were rewriting the reactive pages as React wrappers and building the layout that Observable used to provide for free, and that is the kind of work AI agents now handle well.
