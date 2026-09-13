/**
 * Entry date formatting, mirroring lsts/content.ts on the Observable site,
 * which used d3's `timeFormat("%B %d, %Y")` for both the entry header and the
 * section listings. That gives a padded day, so "May 01, 2014" rather than
 * "May 1, 2014".
 *
 * Dates in the existing content are not uniform: ISO frontmatter (`2023-01-08`)
 * arrives as a Date, prose (`2014 November 6`) stays a string. Both are
 * accepted, as in `entryPath`.
 */
export const formatDate = (value: unknown): string => {
  const date = value instanceof Date ? value : new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
};
