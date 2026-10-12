---
applyTo: "src/components/**/*.{ts,tsx}"
---

# TypeScript Development Guidelines

Instructions for TypeScript components in the `src/components/` directory. They are React components rendered as Astro islands.

## Conventions

- Import npm packages by their plain name (e.g. `"react"`, `"d3"`), and local modules without a file extension (e.g. `"./shared/inputs"`).
- Use `import * as React from "react"` for React.
- No `any` types; define explicit interfaces or type aliases for props and data shapes.
- Use `import type` or `import { type Foo }` for type-only imports so the import is dropped at compile time rather than resolved at runtime.
- Export the component as the default export.

## Component Structure

- Use a `useRef` to obtain the container DOM element.
- Read dimensions (`el.offsetWidth` / `el.offsetHeight`) inside `useEffect`; never hardcode sizes.
- Always return a cleanup function from `useEffect` to cancel animation frames, timers, and event listeners.
- List all props that should trigger re-render in the `useEffect` dependency array.
- Keep all logic in the `.tsx` file; the corresponding `.mdx` page should be minimal.

## Subdirectories

- CFD-related components go in `src/components/cfd/`.
- General blog/lab components go directly in `src/components/`. The component a page imports is named `{Name}Demo.tsx` (PascalCase) for lab entries, and can delegate the drawing to a lowercase module such as `cylinder.tsx`.
- Components and modules used by more than one component or page live in `src/components/shared/`. That includes the shared controls and the `useRemote` data hook in `src/components/shared/inputs.tsx`.

## Node Version Management

Use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.

### Common commands

```bash
nvm install --lts          # install the latest LTS release
nvm use --lts              # switch to the latest installed LTS
nvm use <version>          # switch to a specific version (e.g. nvm use 22)
nvm ls                     # list installed versions
nvm ls-remote --lts        # list available LTS releases
nvm alias default <version> # set the default version for new shells
```

The project Node version is pinned in `.nvmrc`. Run `nvm use` (no argument) in the repo root to switch automatically.

### Updating nvm itself

```bash
# replace vX.Y.Z with the latest release from https://github.com/nvm-sh/nvm/releases
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/vX.Y.Z/install.sh | bash
```

After running the installer, restart your shell (or `source ~/.bashrc` / `source ~/.zshrc`) and verify with `nvm --version`.
