# Release Instructions

Releases are driven by `v*` git tags. Pushing a tag triggers
`.github/workflows/release.yml`, which:

1. extracts the matching `## vX.Y.Z` section from `.github/release-notes.md`
   and fails straight away if it is missing,
2. checks that the tag matches the `version` in `package.json`,
3. runs the python tests and builds the site from the tagged commit, with the
   same steps as the `deploy` workflow,
4. publishes the extracted section as the GitHub Release body. Re-runs update
   the existing release instead of failing.

The release workflow does not deploy. Deployment still happens through the
`deploy` workflow on every push to `main`.

## Collecting Changes

`.github/release-notes.md` is where changes are collected between releases.
When a change worth mentioning lands, add an entry under the section of the
next, unreleased version at the top of the file, creating that section if it
does not exist yet.

## Cutting a Release

1. Bump `version` in `package.json` to the new release version and run
   `npm install` so `package-lock.json` picks it up. Ask what version to use if
   you are not sure. The version can stay the same if it was already bumped.
2. Make sure `.github/release-notes.md` has a `## vX.Y.Z` section at the top
   describing the release. The header is matched verbatim by the workflow's
   `awk` extractor, so it must be `## vX.Y.Z` exactly, with no title after the
   version.
3. Commit and merge to `main`, and let the `deploy` workflow pass.
4. From `main`, run `make release`. It reads the version from `package.json`,
   asks for confirmation, then creates an annotated `vX.Y.Z` tag and pushes it.
   The `release` workflow takes it from there.

## Release Notes Conventions

The `## vX.Y.Z` section is published verbatim as the GitHub Release body, so:

- Open with a short paragraph describing the theme of the release.
- Group entries under H3 subsections in this order: `### Breaking changes`,
  `### New features`, `### Improvements and fixes`, `### Content`. Omit any
  subsection that has no entries.
- Every PR reference must be a full markdown link of the form
  `[#NN](https://github.com/lsbardel/lucasbardella.com/pull/NN)`, never a bare
  `(#NN)`.
- Use absolute URLs for links to the site, such as
  `https://lucasbardella.com/lab/...`, since relative links do not resolve on
  GitHub.
- Build the list with `git log vPREV..HEAD --oneline` against the previous
  release tag, and cross check with `gh pr list --state merged --base main`.
- Never invent changes. Only list what the commits and PRs show.
- Follow the content rules: no dashes to separate clauses.
- End the section with a
  `[Full changelog](https://github.com/lsbardel/lucasbardella.com/compare/vPREV...vX.Y.Z)`
  link.
