---
applyTo: "lspy/**/*.py, cfd/**/*.py, content/data/**/*.py"
---


# Python Development Guidelines

Instructions for python development.

## Tools and Libraries

- Use `uv` for package management and dependency resolution.
- Use `make py-install` to install dependencies and set up the development environment.
- Use `quantflow` for data fetching and financial data analysis.
- Use `pandas` for data manipulation and analysis.
- Use `make py-lint` to run the linters (black, ruff, mypy) - make sure this is passing before committing code.
