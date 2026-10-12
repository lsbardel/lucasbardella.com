---
name: blog
description: Create a blog post with substantial content, interactive charts, and SEO-friendly structure following the guidelines in this document.
---

# Blog Post Guidelines

Blog posts live in the `/blog` section of the site and are built with [Astro](https://astro.build).
They are served at `/blog/{year}/{slug}`, with the year taken from the `date` frontmatter.

## File Structure

A blog post is a single file:

- **Markdown page**: `src/content/blog/{slug}.md`, or `src/content/blog/{slug}.mdx` when the post imports components

When the post includes interactive visualizations, also create:

- **TypeScript component**: `src/components/{Name}.tsx`, all chart and animation logic
- **Data loader**: `dataloaders/{slug}.{ext}.py`, data fetching script (if external data is needed), registered in `dataloaders/build.ts`

## Frontmatter

```md
---
title: Full Descriptive Title With Target Keywords
description: A 150–160 character summary of the post that will appear in search results and social previews. Make it compelling and keyword-rich.
date: YYYY-MM-DD
keywords: comma, separated, keywords, matching, search, intent
---
```

### Frontmatter rules

- **`title`**: 50–70 characters. Include the primary keyword near the front. Avoid clickbait — be specific and descriptive.
- **`description`**: 150–160 characters. Summarise the post's value clearly. Include the primary keyword naturally.
- **`date`**: ISO format `YYYY-MM-DD`.
- **`keywords`**: 5–10 terms covering primary topic, subtopics, and related concepts.

## Content Structure and SEO

Blog posts must have **substantial content** — at minimum 600 words of body text. Posts covering technical topics should aim for 1000+ words.

### Required sections

1. **Introduction** (2–3 paragraphs): State the problem or question, why it matters, and what the reader will learn. Include the primary keyword in the first paragraph.
2. **Body sections** (H2 headings): Break the content into logical sections. Each H2 should target a related keyword or subtopic.
3. **Conclusion** (1–2 paragraphs): Summarise key takeaways and suggest next steps or further reading.

### Heading hierarchy

- Use `##` (H2) for main sections — these are indexed by search engines.
- Use `###` (H3) for subsections within a section.
- Never skip levels (e.g. H2 → H4).
- H2 headings should read naturally and include relevant keywords where it fits.

### Writing guidelines

- Write for a technically literate audience — do not over-explain basics, but define jargon on first use.
- Use short paragraphs (3–5 sentences). One idea per paragraph.
- Use bullet lists for enumerations of 3+ items.
- **Never use dashes (em dashes or hyphens) to connect or separate clauses.** Rewrite the sentence using a comma, a full stop, or a conjunction instead.
- Include internal links to related posts or pages on the site where relevant.
- Include external links to authoritative sources (documentation, papers, official sites) to support claims.
- Avoid filler phrases ("In this post, we will...", "As you can see...", "It is worth noting that...").

### SEO checklist

- [ ] Primary keyword appears in: title, description, first paragraph, at least one H2, and naturally throughout the body.
- [ ] Post answers a clear question or solves a specific problem.
- [ ] Images and charts have descriptive captions or surrounding context.
- [ ] External links open in a new tab (`target="_blank"`) where appropriate.
- [ ] No duplicate content from other posts — each post covers a distinct angle.

## Callouts

Use callout blocks, styled in `src/styles/site.css`, to visually highlight important information. Four types are available:

```html
<div class="note">

A general informational aside — data limitations, methodology notes, context.

</div>
```

```html
<div class="tip">

A helpful insight or non-obvious fact the reader should know.

</div>
```

```html
<div class="warning">

A caveat, known issue, or something the reader should be cautious about.

</div>
```

```html
<div class="caution">

A critical issue that could lead the reader astray if ignored.

</div>
```

Use callouts sparingly — one or two per post. Leave a blank line inside the div so the content is parsed as Markdown (enabling bold, links, etc.). Do not wrap every paragraph in a callout.

## Interactive Content

Charts and interactive elements are React components rendered as Astro islands in an `.mdx` post.

### Data loading

Do not inline large datasets in the markdown. Data fetching scripts go in `dataloaders/` and follow the
[Python data loader conventions](../../../.github/instructions/python-instructions.md). Register each one in the
`LOADERS` list of `dataloaders/build.ts`; `make data` runs the loaders whose output is missing and CI runs it before the build.

A loader writing to `public/data/` is fetched at runtime with `useRemote` from `src/components/shared/inputs.tsx`:

```tsx
const data = useRemote("/data/my-data.csv", (text) => d3.csvParse(text, d3.autoType));
```

A loader writing to `src/data/` is imported at build time instead.

### TSX components

Charts live in a TypeScript component in `src/components/` and are imported at the top of the `.mdx` post:

```mdx
import MyChart from "../../components/MyChart";
```

Render it with `client:load`, otherwise it is rendered to static HTML with no interactivity:

```mdx
<MyChart client:load />
```

Follow the same component conventions as lab entries (see lab skill).

### Plots

Use [Observable Plot](https://observablehq.com/plot/) (`@observablehq/plot`) inside a component for charts,
as `src/components/FedRates.tsx` and `src/components/UkPowerChart.tsx` do. Size the chart from the container width
read in `useEffect`, never a hardcoded width.

## Hero Image

Blog posts support a hero image via frontmatter. Use the `images` skill to find and register an image, then add:

```md
---
heroImage: my-image-name
heroOpacity: 0.4
---
```

See the `images` skill for how to register images.

## Example Post Structure

```md
---
title: How to Price Crypto Options With Python
description: A practical guide to pricing Bitcoin and Ethereum options using QuantFlow and the Deribit API, with live market data.
date: 2025-08-09
keywords: crypto options, options pricing, quantflow, deribit, python, black-scholes
---

Opening paragraph stating the problem and what the reader will learn. Include the primary keyword naturally.

Second paragraph providing context — why this matters, what gap it fills.

## What Are Crypto Options

Explanation of the concept...

## Setting Up QuantFlow

Step-by-step instructions...

### Installing the Library

...

## Pricing a European Option

Core technical content...

<OptionsChart client:load />

Chart or interactive element here, imported at the top of the `.mdx` file.

## Results and Interpretation

Discuss findings, limitations, and what the data shows.

## Conclusion

Summary of what was covered, key takeaways, and pointers to further reading.
```
