---
name: hero
description: Add a hero PageHeader to the top of the page, with an optional background image and title text.
---

# Hero Skill

This skill adds a hero PageHeader to the top of the page, just below the observable headers.
This skill is only needed for general pages like the homepage and credits page, not for
`lab`, `blog` and `coding`. These section can configure the hero directly in the observable headers.

## Configuration

When asked to add a hero image, the agent should:

* Ask for the name of the image to use, which must be one of the registered images in `content/data/images.json.py`
* If the image is not registered, the agent should ask for
  * the `photo_id`
  * the `provider` - Unsplash or Pixabay - assume Unsplash if not specified
  * propose to add it to the registry
* Ask for the opacity of the image, which should be a number between 0 and 1 (e.g. 0.5 for 50% opacity)
* Optionally ask for a blur value — a Tailwind blur utility class (`blur-sm`, `blur`, `blur-md`, `blur-lg`, `blur-xl`, `blur-2xl`, `blur-3xl`). Omit the prop if not provided.

With this information the agent should place the following text in the page
