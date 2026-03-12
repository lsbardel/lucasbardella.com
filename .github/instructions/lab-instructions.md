---
applyTo: "content/lab/**"
---

# Lab Entry Guidelines

Lab entries are interactive experiments in the `/lab` section of the site.
They are built with [Observable Framework](https://observablehq.com/framework/) and served at `/lab/{year}/{slug}`.

## File Structure

Each lab entry consists of two files:

1. **Markdown page**: `content/lab/{slug}.md` — the Observable Framework page with inputs and layout
2. **TypeScript component**: `content/components/{slug}.tsx` — all logic and rendering

The page is served dynamically at `/lab/{year}/{slug}` via `content/lab/[year]/[slug].md.ts`.

## Markdown Page (`content/lab/{slug}.md`)

### Frontmatter

```md
---
title: My Lab Entry
description: A short description shown in the lab listing.
date: YYYY-MM-DD
keywords: comma, separated, keywords
---
```

### Imports and display

Always import the component in a `tsx` code block, not a `js` block:

```tsx
import MyComponent from "../../components/my-component.js";
```

Use Observable `Inputs` for interactive controls, each in its own `js` block so they are individually reactive:

```js
const speed = view(Inputs.range([0.1, 5], {step: 0.1, value: 1.5, label: "Speed"}));
```

Render the component in a `tsx` block, passing input values as props:

```tsx
display(<MyComponent speed={speed} />);
```

## TypeScript Component (`content/components/{slug}.tsx`)

### Template

```tsx
import * as React from "npm:react";

interface Props {
  // define props here
}

const MyComponent = ({ prop = defaultValue }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // setup (canvas, animation loop, etc.)

    return () => {
      // cleanup (cancelAnimationFrame, removeEventListener, etc.)
    };
  }, [/* reactive props */]);

  const style = { width: "100%", position: "relative" as const, paddingTop: aspectRatio };
  const innerStyle = { position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0 };

  return (
    <div style={style}>
      <div ref={ref} style={innerStyle} />
    </div>
  );
};

export default MyComponent;
```

### Key conventions

- **Canvas sizing**: read `el.offsetWidth` / `el.offsetHeight` inside `useEffect` — never hardcode dimensions
- **Cleanup**: always return a cleanup function from `useEffect` to cancel animation frames, timers, and event listeners
- **Reactivity**: list all props that should restart the animation in the `useEffect` dependency array
- **Imports**: use `npm:` prefix for npm packages (e.g. `"npm:react"`, `"npm:d3"`)
- **No inline JS**: keep all logic in the `.tsx` component, keep the `.md` file minimal
- **TypeScript**: no `any` types; define explicit interfaces for props and data shapes

## Observable Framework Patterns

- `view(input)` — makes an input reactive; the variable updates whenever the input changes
- `display(element)` — renders a DOM element or React component into the page
- `invalidation` — a Promise that resolves when the cell is re-run; use for cleanup in plain `js` blocks
- `FileAttachment("path")` — loads a file (CSV, JSON, etc.) as a reactive data dependency


## CFD Specific Guidelines

* Typescript components must be located inside the `content/components/cfd` directory
* Mesh must be plotted using `mesh.plot()` to ensure consistent styling across entries
