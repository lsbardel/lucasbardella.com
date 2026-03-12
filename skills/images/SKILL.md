---
name: images
description: Search Unsplash or Pixabay for the best free image matching a given topic and propose the photo ID to register in content/data/images.json.py.
---

# Images Skill

This skill enables the agent to search [Unsplash](https://unsplash.com) or [Pixabay](https://pixabay.com) for high-quality, freely licensed images and propose the photo ID to add to the site's image registry.

## How images are registered

Images are registered in `content/data/images.json.py` as entries in the `PHOTOS` tuple:

```python
PHOTOS = (
    ("rust1", ImageProvider.UNSPLASH, "PEy4qZCLXss"),
    ("gold", ImageProvider.UNSPLASH, "jrA2l3JjD5k"),
    ("vortex", ImageProvider.UNSPLASH, "BhZBnHzUQ7o"),
    ("rust2", ImageProvider.PIXABAY, "3397227"),
)
```

Each entry is a 3-tuple: `(name, provider, photo_id)`.

- `name` — a short slug used to reference the image elsewhere (e.g. as `heroImage: vortex` in frontmatter)
- `provider` — from the `ImageProvider` enum
- `photo_id` — the unique ID of the photo on the provider

## Search Workflow

1. **Formulate a query** — derive 2–4 descriptive keywords from the page topic (e.g. `"cryptocurrency trading dark"`, `"fluid dynamics vortex"`).
2. **Search Unsplash first**:
   ```
   https://unsplash.com/s/photos/<query-with-dashes>
   ```
   The photo ID is the alphanumeric code at the end of the photo URL, e.g.:
   ```
   https://unsplash.com/photos/PEy4qZCLXss  →  photo_id = "PEy4qZCLXss"
   ```
3. **Fall back to Pixabay** if Unsplash has no good match:
   ```
   https://pixabay.com/images/search/<query-with-plus-signs>/
   ```
   The photo ID is the numeric ID in the photo URL, e.g.:
   ```
   https://pixabay.com/photos/rust-metal-3397227/  →  photo_id = "3397227"
   ```

## Image selection criteria

Prefer images that are:
- Landscape orientation (wider than tall)
- Dark or neutral-toned when used as a background behind text
- High resolution (≥ 1920 px wide)
- Free to use without attribution (Unsplash licence or Pixabay licence)

## Proposing the result

Present the result to the user as:
- The **photo ID** and **provider**
- A **preview URL** so the user can verify the image visually
- A **suggested name slug** and the ready-to-paste tuple entry, e.g.:

```python
("crypto", "unsplash", "abc123XYZ"),
```

The user will add this line to the `PHOTOS` tuple in `content/data/images.json.py`.
