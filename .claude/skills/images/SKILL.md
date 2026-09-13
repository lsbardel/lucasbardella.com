---
name: images
description: Register a new image in the site's image registry from a provider and photo ID supplied by the user, then regenerate the image data.
---

# Images Skill

Adds an image to the site's registry so pages can use it, for example as a hero.
The user supplies the provider and the photo ID; this skill does not search for
images.

## Ask for

1. **Provider** — `unsplash` or `pixabay`.
2. **Photo ID** — the id on that provider. It is the last part of the photo URL:
   ```
   https://unsplash.com/photos/PEy4qZCLXss        ->  PEy4qZCLXss
   https://pixabay.com/photos/rust-metal-3397227/ ->  3397227
   ```
3. **Name** — a short slug the site refers to the image by, such as `vortex`.
   Propose one from the topic if the user does not give one.

Ask for anything missing before editing. If the user pastes a photo URL, read the
provider and the id out of it rather than asking again.

## Register it

Add a 3-tuple to the `PHOTOS` tuple in `dataloaders/images.json.py`:

```python
PHOTOS = (
    ("rust1", ImageProvider.UNSPLASH, "PEy4qZCLXss"),
    ("gold", ImageProvider.UNSPLASH, "jrA2l3JjD5k"),
    ("rust2", ImageProvider.PIXABAY, "3397227"),
    ("crypto", ImageProvider.UNSPLASH, "abc123XYZ"),   # the new entry
)
```

The provider must be an `ImageProvider` enum member, not a string. Names are
unique: if one is already taken, ask before overwriting it.

## Regenerate

The registry is only the list of ids. The URLs the site uses live in
`src/data/images.json`, which is generated and gitignored, so a new entry does
nothing until the loader runs:

```bash
make data-force
```

`make data` on its own skips the loader when `src/data/images.json` already
exists, so use `data-force` here. The loader resolves every id through
`api.metablock.io/v1/photos/{provider}/{id}`.

## Verify

Check the new name is present in `src/data/images.json` and that its `regular`
URL returns 200. Pixabay serves signed URLs that expire, so a Pixabay entry that
worked yesterday can 400 today; that is expected, and the CI build regenerates
the file on every deploy.

Report the new name to the user and how to use it in frontmatter:

```md
heroImage: crypto
heroOpacity: "0.3"
```
