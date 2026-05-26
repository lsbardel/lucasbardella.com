---
name: nodash
description: Scan a file or piece of content and remove all em dashes and clause-separating hyphens, replacing them with proper punctuation.
---

# No Dash

Scan the target file(s) for em dashes and hyphens used to connect or separate clauses, and replace every single one with proper punctuation.

## What to remove

- Em dashes: `—`
- En dashes used as separators: `–`
- Hyphens used to connect clauses or as an aside: ` - `

## How to replace

| Pattern | Replace with |
|---|---|
| `X — Y` (aside or parenthetical) | Rewrite as two sentences, or use commas |
| `X, — Y` | Remove the dash, keep the comma |
| `X - Y` (clause separator) | Use a comma, full stop, or conjunction |
| `X — Y — Z` (double aside) | Rewrite as a single clear sentence |

## What NOT to remove

- Hyphens in compound adjectives that are standard usage: `real-time`, `open-source`, `long-term`, `state-of-the-art`
- Hyphens in proper names or product names: `GPT-4`, `claude-3`, `@anthropic-ai/sdk`
- Hyphens in URLs or code
- Hyphens in number ranges inside code blocks: `2020-2024`

## Process

1. Read the target file.
2. Search for all em dashes (`—`) and ` - ` patterns in prose.
3. For each occurrence, rewrite the sentence using a comma, colon, full stop, or conjunction — never just delete the dash without fixing the sentence structure.
4. Write the fixed content back.
5. Do a final grep to confirm no em dashes remain.
