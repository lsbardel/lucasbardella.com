---
name: blog
description: Create a blog post with substantial content, interactive charts, and SEO-friendly structure following the guidelines in this document.
---

# Blog Post Guidelines

Blog posts live in the `/blog` section of the site and are built with [Observable Framework](https://observablehq.com/framework/).
They are served at `/blog/{year}/{slug}`.

## File Structure

A blog post is a single file:

- **Markdown page**: `content/blog/{slug}.md`

When the post includes interactive visualizations, also create:

- **TypeScript component**: `content/components/{slug}.tsx` — all chart/animation logic
- **Data loader**: `content/data/{slug}.{ext}.py` — data fetching script (if external data is needed)

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

Use Observable Framework callout blocks to visually highlight important information. Four types are available:

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

Use Observable Framework for charts and interactive elements.

### Data loading

Load data via `FileAttachment` — do not inline large datasets in the markdown:

```js
const data = FileAttachment("../../data/my-data.json").json();
```

Data fetching scripts go in `content/data/` and follow the [Python data loader conventions](../.github/instructions/python-instructions.md).

### TSX components

When a chart or interactive element requires significant logic, create a TypeScript component in `content/components/{slug}.tsx` and import it:

```tsx
import MyChart from "../../components/my-chart.js";
```

```tsx
display(<MyChart data={data} />);
```

Follow the same component conventions as lab entries (see lab skill).

### Inline plots

For simple, one-off charts that don't need reuse, use Observable Plot inline:

```js
display(Plot.plot({
  marks: [Plot.lineY(data, {x: "date", y: "value", stroke: "series"})],
  width,
}));
```

Use `resize((width) => ...)` when the chart should respond to container width.

## Hero Image

Blog posts support a hero image via frontmatter. Use the `images` skill to find and register an image, then add:

```md
---
heroImage: my-image-name
heroOpacity: 0.4
---
```

See the `images` skill for how to search and register images.

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

```js
const data = FileAttachment("../../data/options/btc.csv").csv({typed: true});
```

Chart or interactive element here.

## Results and Interpretation

Discuss findings, limitations, and what the data shows.

## Conclusion

Summary of what was covered, key takeaways, and pointers to further reading.
```
