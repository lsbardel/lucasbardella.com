---
applyTo: "src/content/lab/**"
---

# Lab Entry Guidelines

Lab entries are interactive experiments in the `/lab` section of the site.
They are built with [Astro](https://astro.build) as MDX pages with React islands and served at `/lab/{year}/{slug}`.

## File Structure

Each lab entry consists of two files:

1. **MDX page**: `src/content/lab/{slug}.mdx`, the page with prose and the component
2. **TypeScript component**: `src/components/{Name}Demo.tsx`, all logic, controls and rendering

Larger entries split the component: the `{Name}Demo.tsx` wrapper holds the controls and state, and
a lowercase file such as `src/components/cylinder.tsx` holds the drawing logic.

The URL is built by `src/pages/[...slug].astro` from the collection defined in
`src/content.config.ts`, with the year taken from the `date` frontmatter (see `src/lib/entry-path.ts`).

## MDX Page (`src/content/lab/{slug}.mdx`)

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

Import the component at the top of the MDX file, without a file extension:

```mdx
import MyDemo from "../../components/MyDemo";
```

Render it as a React island with `client:load`, otherwise it is rendered to static HTML with no interactivity:

```mdx
<MyDemo client:load />
```

Controls live inside the component, not in the page. Use the shared inputs in
`src/components/shared/inputs.tsx` (`Controls`, `Range`, `Select`, `Toggle`, `Color`, `Button`) and hold
their values in React state:

```tsx
const [speed, setSpeed] = React.useState(1.5);

<Controls>
  <Range label="Speed" value={speed} onChange={setSpeed} min={0.1} max={5} step={0.1} />
</Controls>
```

Display maths uses fenced ` ```tex ` blocks, which `src/plugins/remark-tex-blocks.mjs` renders with KaTeX.

## TypeScript Component (`src/components/{Name}Demo.tsx`)

### Template

```tsx
import * as React from "react";

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

- **Canvas sizing**: read `el.offsetWidth` / `el.offsetHeight` inside `useEffect`, never hardcode dimensions
- **Cleanup**: always return a cleanup function from `useEffect` to cancel animation frames, timers, and event listeners
- **Reactivity**: list all props that should restart the animation in the `useEffect` dependency array
- **Imports**: import npm packages by their plain name (e.g. `"react"`, `"d3"`, `"@observablehq/plot"`), and local modules without a file extension (e.g. `"./shared/inputs"`)
- **No inline JS**: keep all logic in the `.tsx` component, keep the `.mdx` file to prose and the component tag
- **TypeScript**: no `any` types; define explicit interfaces for props and data shapes
- **Type-only imports**: TypeScript interfaces and types are erased at compile time and do not exist in the emitted JS. When importing a type from another module, always use `import type` or the inline `import { type Foo }` syntax, so the import is dropped rather than resolved at runtime:
  ```tsx
  // correct, type is stripped at compile time
  import { type BaseProps, MyComponent } from "./base";

  // wrong, the bundler looks for a BaseProps export that does not exist
  import { BaseProps, MyComponent } from "./base";
  ```

## Data

- Remote data comes from a loader in `dataloaders/`, registered in the `LOADERS` list of
  `dataloaders/build.ts`. `make data` runs the loaders whose output is missing, and CI runs it before the build.
- Output under `public/data/` is fetched at runtime with `useRemote` from `src/components/shared/inputs.tsx`:
  ```tsx
  const rows = useRemote("/data/my-data.csv", (text) => d3.csvParse(text, d3.autoType));
  ```
- Output under `src/data/` is imported at build time instead.

## CFD Specific Guidelines

* Typescript components must be located inside the `src/components/cfd` directory
* Mesh plots must use the shared helpers in `src/components/cfd/mesh2d.tsx` (`fieldRaster`, `drawGrid`, `drawBoundaryEdges`, `drawStreamlines`, `colorLegend`) to ensure consistent styling across entries
