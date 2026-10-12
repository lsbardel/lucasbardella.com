---
name: hero
description: Add a hero PageHeader to the top of the page, with an optional background image and title text.
---

# Hero Skill

This skill adds a hero header to the top of a page. The header is rendered by `src/layouts/Base.astro`
from the page frontmatter. This skill is only needed for general pages in `src/pages/` like the homepage
and credits page, not for `lab`, `blog` and `coding`. Those sections set the same fields directly in
their frontmatter.

## Configuration

When asked to add a hero image, the agent should:

* Ask for the name of the image to use, which must be one of the registered images in `dataloaders/images.json.py`
* If the image is not registered, the agent should ask for
  * the `photo_id`
  * the `provider` - Unsplash or Pixabay - assume Unsplash if not specified
  * propose to add it to the registry with the `images` skill
* Ask for the opacity of the image, which should be a number between 0 and 1 (e.g. 0.5 for 50% opacity)
* Optionally ask for a blur value — a Tailwind blur utility class (`blur-sm`, `blur`, `blur-md`, `blur-lg`, `blur-xl`, `blur-2xl`, `blur-3xl`). Omit the prop if not provided.

* Optionally ask for a subtitle, shown under the title in place of the description.

With this information the agent should add the fields to the page frontmatter, which must use the
`Base.astro` layout. For example, `src/pages/credits.mdx`:

```md
---
layout: ../layouts/Base.astro
title: Credits
description: A thank you to the open-source authors and communities that make this site possible
heroImage: thanks
heroOpacity: "0.5"
heroBlur: blur-sm
heroAspectRatio: "40%"
heroSubtitle: None of this exists without the open-source community. Thank you.
---
```

`heroAspectRatio` defaults to `35%` and can be omitted, as can `heroBlur`, `heroTextColor` and `heroSubtitle`.
