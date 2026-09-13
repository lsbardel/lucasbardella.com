---
title: Observable to Astro
description: What it took to move sixty pages, twenty five components and an interactive CFD simulation off Observable Framework, and what the site weighs now.
date: 2026-09-12
keywords: observable framework, astro, site migration, react islands, static site generator, npm resolution, bundle size, mdx, tailwind
private: true
---

This site ran on [Observable Framework](https://observablehq.com/framework/) for several years and it was a good fit. Markdown pages with reactive code cells are a pleasant way to write technical posts, the data loader model is clean, and the reactive runtime removes wiring you would otherwise do by hand. It now runs on [Astro](https://astro.build), and the reason has nothing to do with any of that.

The trigger was mundane. The market heatmap page needed a searchable dropdown, because the list of markets had grown past two hundred entries and a plain `select` had become unusable. That is a solved problem with several mature libraries, so I reached for one, and every candidate shipped a second copy of React into the page.

This is an account of the port: what forced it, what came across untouched, what had to be rewritten, and what the site weighs now. The short version is that the migration was smaller than the page count suggested, and the cost was concentrated in about a fifth of the site.

<div class="note">

Every number here is measured from the actual build rather than estimated. Where something was not measured, it is not claimed.

</div>

## Why We Left Observable Framework

Observable Framework resolves `npm:` imports through a CDN at build time rather than through a local `node_modules` tree. That is a deliberate design choice with real benefits. You install nothing, you maintain no dependency tree for a content site, and a one line import gives you a library.

The cost appears with any package declaring React as a peer dependency. The CDN resolves that range independently and picks the lowest version satisfying it. Your page is already running one version of React. The library arrives bound to another. Nothing deduplicates them, because in ES modules identity is the URL, so two URLs are two separately initialised modules.

I measured four candidates for that dropdown. All four had the same defect:

| Library | React it pulled in | Modules added |
|---|---|---|
| `react-select` | 16.14.0 plus `react-dom` 16 | 53 |
| `downshift` | 18.3.1 | 13 |
| `@tanstack/react-virtual` | 19.3.0 | 9 |
| `@headlessui/react` | 18.3.1 plus `react-dom` 18 | 48 |

The page was on React 19. Hooks depend on module level mutable state, so when `react-dom` renders your tree it sets the current dispatcher on its own copy of React. A component calling `useState` from a different copy sees no active render and throws [Invalid hook call](https://react.dev/warnings/invalid-hook-call-warning). Context breaks the same way, since a provider in one copy is a different object from the one a consumer reads in the other.

Version proximity does not save you. TanStack pulled React 19.3.0 while the page ran 19.2.4, which are semver compatible and would collapse to one copy under any bundler. They still break, because the deduplication step a bundler performs does not exist in this pipeline. There is no lockfile to pin and no resolutions field, so the practical rule is that React component libraries are unavailable as a category.

I hand rolled the dropdown in under two hundred lines, and for that one case the result was better than the library would have given. It is controlled rather than uncontrolled, so browser history keeps working, and it inherits the site styles instead of needing a stylesheet overridden. That is a fine outcome once and a bad position permanently. Under Astro the same page resolves a single copy of React and any of those libraries would simply work.

## What The Site Was Made Of

Before starting, it was worth counting what actually had to move:

| Surface | Count |
|---|---|
| Markdown pages | 60 (19 blog, 17 lab, 5 coding) |
| TypeScript components | 25 |
| Data loaders | 17 (10 Python, 4 TypeScript) |
| Dynamic route files | 6 |
| Pages using `view()` and `Inputs` | 12 |
| Pages using `FileAttachment` | 18 |

That last group is the one that matters. Sixty pages sounds like a large migration, but most of them are prose. The genuine lock in is the twelve pages built on the reactive runtime, because that is the part Astro has no equivalent for.

## What Ported Without Changes

Prose pages moved by copying the file. Frontmatter is compatible, and Astro's content collections accept the loose date formats already in the content, where some pages carry `2023-01-08` and others `2014 November 6`.

Maths needed one small piece of glue. Observable renders ```` ```tex ```` fenced blocks as display maths, which is a framework convention rather than a markdown one. A remark plugin of about twenty lines rewrites those fences into the nodes [rehype-katex](https://github.com/remarkjs/remark-math) already understands, so existing posts render their equations without being touched.

The components were the real surprise. All twenty five import only genuine npm packages, `react`, `d3`, `@observablehq/plot`, `topojson-client`, `htl` and `d3-quant`, so porting them meant deleting the `npm:` prefix. The Mandelbrot component is a hundred and thirty one lines and three import lines changed. Nothing in any component body was rewritten.

## What The Reactive Pages Cost

Observable's reactive runtime is the one thing with no Astro equivalent, and converting it is the bulk of the work. A lab entry like the Mandelbrot set declares an input and a display, and the runtime re-runs the display whenever the input changes.

The port moves that state into the component. The controls and the `useState` calls live together, and React re-renders instead of the runtime re-running a cell. For the Mandelbrot page, a twenty three line markdown file became a thirteen line MDX file plus a thirty six line wrapper component. The canvas component underneath did not change at all.

That is the shape of all twelve conversions. The page gets shorter, a wrapper appears, and the real logic stays where it was.

## The Hardest Page

The interactive CFD post was the worst case in the repo and the one that decided whether this was feasible. It drives a lid driven cavity simulation with nine inputs: Reynolds number, particle count, particle radius, time, palette, field, and three display toggles. Underneath are six hundred lines of component code across a canvas renderer and a mesh library, and the data arrives as zipped JSON from a Python loader.

The components came across with import lines only, as everywhere else. The nine inputs became one wrapper component of about a hundred and sixty lines. The data needed more thought: the two cases are thirty megabytes of raw JSON, nine and a half zipped, which is far too much to bundle. Observable fetched a zip through `FileAttachment` and read files out of it, so the port does the same with [fflate](https://github.com/101arrowz/fflate), loading only the case being viewed and keeping it once loaded.

One behaviour needed care. In Observable the time slider is rebuilt when the case changes, because its range comes from the selected solution, which silently resets it to the final step. Reproducing that took an effect keyed on the loaded solution. Without it the slider keeps a value outside its own range, which is the kind of bug that survives a build and a glance.

## Rebuilding The Layout

Observable gives you a layout. A `pages` array in the config produces a sidebar, a theme and a footer with no component written. Astro is deliberately unopinionated and ships none of it. [Starlight](https://starlight.astro.build) exists and includes a sidebar and search, but it is a documentation theme that replaces the whole layout, which is the wrong trade for a personal site.

So the sidebar was the first component built, since without it nothing is reachable. The structure stayed declarative, mirroring the shape of the old config, with sections populated from the content collections. Reproducing the behaviour mattered more than the markup: drafts dropped, newest first, entries labelled by year. Two things Observable did silently had to be added explicitly, highlighting the current page and expanding the section containing it. It uses native `details` elements, so the navigation on every page costs no JavaScript.

Page width needed an equivalent too. Observable sets it from frontmatter, where
`theme: dashboard` widens a page out of the reading column, which is how the market
pages get their room. Astro has no such convention, so the layout takes a `width` prop
with three values: `prose` for the reading column and the default for posts, `wide` for
pages with a couple of panels, and `full` for dashboards that should run edge to edge.
It is one prop, one class and three rules, and it replaces a framework feature that
would otherwise be quietly lost:

```astro
<Base title="US Interest Rates" width="full">
```

One field nearly caused an accident. Posts marked `private: true` are hidden from every listing, and Astro has no idea what that means. A port that ignores it publishes every unfinished draft the moment it deploys.

[Tailwind](https://tailwindcss.com) is not part of Astro, which has no opinion about CSS and supports scoped styles, CSS modules and Sass out of the box. Using it was continuity rather than a new decision, because the site already did. What changed is how it arrives. Observable loaded it from the play CDN with a script tag, fetching the framework at runtime and compiling classes in the browser, a build Tailwind documents as unsuitable for production. Under Astro it is a build dependency, so the stylesheet carries only the classes actually used.

There is a trap in that switch. Tailwind's preflight resets headings to `font-size: inherit`, which flattens every heading in markdown content to body size. The old config disabled preflight for that reason, and the port has to do the same or the typography quietly collapses.

## Keeping The URLs

Blog, lab and coding entries are published at `/section/year/slug`, with the year derived from the date frontmatter. Those URLs are indexed, so reproducing them exactly was a requirement rather than a preference, and it took one small helper shared between the route and the listings so the two cannot drift.

Worth noting for anyone doing the same: Observable also emits every source file as a page, so each post existed at both `/blog/katex` and `/blog/2014/katex` with identical content and no canonical link. The port publishes only the year form, which removes a duplicate content problem that had been there for years.

## Three Things That Cost Time

<div class="warning">

Astro server renders islands. A component that has not hydrated yet looks exactly like a broken one, and I wasted a debugging cycle concluding the CFD page had failed when it was simply not scrolled into view.

</div>

The other two were cheaper but equally opaque. Astro caches content aggressively, so changes to a remark plugin appear to do nothing until the cache is cleared. And a change to `astro.config.mjs` needs the dev server restarted, which bit me after adding Tailwind: the config was correct, the stylesheet was served unprocessed, and nothing in the output explained why.

## What It Weighs Now

The measurement that justifies the whole exercise:

| Page | HTML | JavaScript |
|---|---|---|
| Prose with maths | 28 KB | none |
| Mandelbrot set | 8 KB | 13 KB |
| CFD cavity | 24 KB | 52 KB |

A prose page ships no JavaScript at all. KaTeX renders at build time, the sidebar collapses with native elements, and nothing hydrates. Of the sixty pages, roughly forty eight are prose, and they now cost nothing to interact with because there is nothing to interact with. The interactive pages load their island and only their island.

## What I Would Tell You

If you are running Observable Framework and it works, stay. The reactive runtime is genuinely good, and nothing here is a complaint about the writing experience.

Move when you hit the dependency wall, because it does not move. Any React library with a peer dependency will duplicate React, and that is structural rather than a bug awaiting a fix. Everything else in this port was mechanical: prose copied, components had a prefix deleted, and the only real work was twelve pages of reactive plumbing and a layout that had previously been free.

Sixty pages sounded like a rewrite. It was twelve pages of reactive plumbing, a prefix deleted across twenty five components, and a layout you no longer get for nothing.
