---
title: Observable to Astro
description: Why a React dependency wall forced this site off Observable Framework, what the port actually cost, and why AI has weakened the case for opinionated frameworks.
date: 2026-09-12
keywords: observable framework, astro, site migration, react islands, static site generator, npm resolution, bundle size, opinionated frameworks, django
private: true
toc: true
---

This site ran on [Observable Framework](https://observablehq.com/framework/) for several years and it was a good fit. Markdown pages with reactive code cells are a pleasant way to write technical posts, and the reactive runtime removes wiring you would otherwise do by hand. It now runs on [Astro](https://astro.build), and the reason has nothing to do with any of that.

The trigger was mundane. The market heatmap page needed a searchable dropdown, because the list of markets had grown past two hundred entries and a plain `select` had become unusable. That is a solved problem with several mature libraries, so I reached for one, and every candidate shipped a second copy of React into the page.

## The Dependency Wall

Observable Framework resolves `npm:` imports through a CDN at build time rather than through a local `node_modules` tree. You install nothing and maintain no dependency tree for a content site. The cost appears with any package declaring React as a peer dependency. The CDN resolves that range independently and picks the lowest version satisfying it. Your page is already running one version of React, the library arrives bound to another, and nothing deduplicates them, because in ES modules identity is the URL, so two URLs are two separately initialised modules.

I measured four candidates for that dropdown. All four had the same defect:

| Library | React it pulled in | Modules added |
|---|---|---|
| `react-select` | 16.14.0 plus `react-dom` 16 | 53 |
| `downshift` | 18.3.1 | 13 |
| `@tanstack/react-virtual` | 19.3.0 | 9 |
| `@headlessui/react` | 18.3.1 plus `react-dom` 18 | 48 |

The page was on React 19. Hooks depend on module level mutable state, so when `react-dom` renders your tree it sets the current dispatcher on its own copy of React. A component calling `useState` from a different copy sees no active render and throws [Invalid hook call](https://react.dev/warnings/invalid-hook-call-warning).

Version proximity does not save you. TanStack pulled React 19.3.0 while the page ran 19.2.4, which are semver compatible and would collapse to one copy under any bundler. They still break, because the deduplication step a bundler performs does not exist in this pipeline. There is no lockfile to pin and no resolutions field, so the practical rule is that React component libraries are unavailable as a category. That is structural rather than a bug awaiting a fix, and it is the only reason this port happened.

## What The Port Actually Cost

Sixty pages sounded like a rewrite. Most of them are prose, and prose moved by copying the file, since frontmatter is compatible and Astro's content collections accept the loose date formats already in the content.

The components were the surprise. All twenty five import only genuine npm packages, so porting them meant deleting the `npm:` prefix. The Mandelbrot component is a hundred and thirty one lines and three import lines changed. Nothing in any component body was rewritten.

The real work was the twelve pages built on the reactive runtime, which is the one thing Astro has no equivalent for. The port moves that state into the component: the controls and the `useState` calls live together, and React re-renders instead of the runtime re-running a cell. For the Mandelbrot page, a twenty three line markdown file became a thirteen line MDX file plus a thirty six line wrapper. The canvas underneath did not change.

The interactive CFD post was the worst case and the one that decided whether this was feasible. Nine inputs became one wrapper of about a hundred and sixty lines, sitting on six hundred lines of unchanged component code. The data needed more thought: the two cases are thirty megabytes of raw JSON, nine and a half zipped, so the port reads them out of the zip with [fflate](https://github.com/101arrowz/fflate), loading only the case being viewed.

The other cost was the layout. Observable gives you a sidebar, a theme and a footer from a `pages` array in the config. Astro is deliberately unopinionated and ships none of it, so the sidebar was the first component built, along with an equivalent for the page width that Observable sets from frontmatter. It is a day of work for something that had previously been free.

## AI Has Hollowed Out The Opinionated Framework

I hand rolled that dropdown in under two hundred lines, and the result was better than the library would have given. It is controlled rather than uncontrolled, so browser history keeps working, and it inherits the site styles instead of needing a stylesheet overridden.

A few years ago that sentence would have been a defeat. Writing two hundred lines to avoid an import is exactly the tax an opinionated framework exists to save you from. That bargain was always the same one: accept someone else's structure, get the sidebar, the admin, the ORM, the reactive runtime for nothing. It made sense when writing the code yourself was the expensive part.

It no longer is. The dropdown, the sidebar, the width prop, the twelve wrapper components, all of it was written in an afternoon with an agent, and none of it is code I need to maintain in the sense that word used to carry. What the framework was selling has quietly become cheap, while what it charges has not changed at all. You still inherit its structure, its upgrade path, and in Observable's case a module resolution model that made an entire category of library unusable.

This applies well beyond static site generators. Django's pitch is the same: batteries included, conventions decided, an admin and an ORM you did not write. Weigh that now against a few hundred lines of FastAPI and SQL that you did not write either, that do exactly what you asked, and that carry no opinion you have to work around when the requirements turn out to be unusual. The generated version is smaller, has no upgrade treadmill, and cannot wall you off from a library.

The remaining case for a framework is not code you would rather not write. It is the constraints worth being held to: a shared structure across a team, a security posture you should not be reinventing, an ecosystem of things that assume it. Those are real. Convenience is not one of them any more, and convenience was most of what the pitch was.

## What It Weighs Now

The measurement that justifies the exercise:

| Page | HTML | JavaScript |
|---|---|---|
| Prose with maths | 28 KB | none |
| Mandelbrot set | 8 KB | 13 KB |
| CFD cavity | 24 KB | 52 KB |

A prose page ships no JavaScript at all. KaTeX renders at build time, the sidebar collapses with native `details` elements, and nothing hydrates. Of the sixty pages, roughly forty eight are prose. The interactive pages load their island and only their island.

## What I Would Tell You

If you are running Observable Framework and it works, stay. The reactive runtime is genuinely good, and nothing here is a complaint about the writing experience.

Move when you hit the dependency wall, because that wall does not move. Everything else in this port was mechanical: prose copied, a prefix deleted across twenty five components, twelve pages of reactive plumbing, and a layout you no longer get for nothing. That last item used to be the strongest argument for staying. It is now the weakest.
