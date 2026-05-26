---
applyTo: "content/components/**/*.{ts,tsx}"
---

# TypeScript Development Guidelines

Instructions for TypeScript components in the `content/components/` directory.

## Conventions

- Import npm packages with the `npm:` prefix (e.g. `"npm:react"`, `"npm:d3"`).
- Use `import * as React from "npm:react"` for React.
- No `any` types; define explicit interfaces or type aliases for props and data shapes.
- Use `import type` or `import { type Foo }` for type-only imports to avoid runtime errors in Observable Framework.
- Export the component as the default export.

## Component Structure

- Use a `useRef` to obtain the container DOM element.
- Read dimensions (`el.offsetWidth` / `el.offsetHeight`) inside `useEffect`; never hardcode sizes.
- Always return a cleanup function from `useEffect` to cancel animation frames, timers, and event listeners.
- List all props that should trigger re-render in the `useEffect` dependency array.
- Keep all logic in the `.tsx` file; the corresponding `.md` page should be minimal.

## Subdirectories

- CFD-related components go in `content/components/cfd/`.
- General blog/lab components go directly in `content/components/`.

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
