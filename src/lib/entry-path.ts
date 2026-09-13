/**
 * URL shape for blog, lab and coding entries.
 *
 * Mirrors lsts/content.ts on the Observable site, which publishes
 * `/<section>/<year>/<slug>` with the year taken from the date frontmatter.
 * These are the canonical URLs the site already has indexed, so a migration
 * has to reproduce them exactly rather than invent a flatter scheme.
 *
 * Dates in the existing content are not uniform: some are ISO (`2023-01-08`,
 * which YAML turns into a Date) and some are prose (`2014 November 6`, which
 * stays a string). Both are accepted, matching `new Date(options.date)` in the
 * Observable loader, which also falls back to today when a page has no date.
 */
export const entryYear = (date: unknown): number => {
  if (date instanceof Date) return date.getFullYear();
  if (typeof date === "string") {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear();
  }
  return new Date().getFullYear();
};

export const entryPath = (section: string, slug: string, date: unknown): string =>
  `/${section}/${entryYear(date)}/${slug}`;
