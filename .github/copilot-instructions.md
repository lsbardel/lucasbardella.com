---
applyTo: "**"
---

# Development Guidelines

Instructions for development on the lucasbardella.com project

The project uses a combination of Python, TypeScript, and Markdown for content. When contributing to the project, please adhere to the following guidelines.

## General Rules

- Only modify code that was explicitly requested.
- Do not refactor, rename, or "improve" anything that was not asked.
- When adding something new, do not touch existing code unless strictly necessary.
- **Never remove existing content or code unless the user explicitly asks for it to be removed.** Improving or rewriting does not mean deleting.
- **Never serve the website.** Do not start a dev or preview server (`make serve-dev`, `make serve-preview`, `npm run dev`, `npm run preview`, `astro dev`, `astro preview`) and do not run anything against one. The user runs the site. Building with `make build` is fine when it is needed to check that a change compiles.

## Languages and Conventions

- For content, refer to the [content instructions](./instructions/content-instructions.md) file.
- Python code is located in the `lspy/` directory, for code conventions and best practices, refer to the [python instructions](./instructions/python-instructions.md) file.
- TypeScript code is located in the `content/components/` directory, for code conventions and best practices, refer to the [typescript instructions](./instructions/typescript-instructions.md) file.
- Lab entries follow the [lab instructions](./instructions/lab-instructions.md) file.
- CFD code follows the [CFD instructions](./instructions/cfd-instructions.md) file.
- Makefile targets should follow the [makefile conventions](./instructions/makefile.instructions.md).
- Releases follow the [release instructions](./instructions/release.instructions.md).
