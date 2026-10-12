---
name: feedback-tables
description: Number columns in content tables are right aligned; dates as MMM-YY and labels that must not wrap
metadata:
  type: feedback
---

In markdown tables, every column holding numbers is right aligned (`---:` in the separator row). Dates in tables use `MMM-YY` with a non-breaking hyphen (`May&#8209;21`), and short labels such as `Series&nbsp;A` use a non-breaking space so they stay on one line. Table text is monospace site wide (`th, td` in `src/styles/site.css`). Money amounts in tables are in millions (`$13,000M`); outside tables, amounts of $1B or more are in billions (`$13B`) and smaller ones stay in millions.

**Why:** the user asked for this while building the AI funding trap post (2026-10-12): "all numbers in a table should align right", and dates must all have the same width.

**How to apply:** whenever writing or editing a table in `src/content/` or `src/pages/`. Related: [[feedback-no-dashes]].
