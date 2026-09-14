import { getCollection } from "astro:content";
import { entryPath } from "./entry-path";

export interface NavItem {
  name: string;
  path: string;
  draft?: boolean;
}

/**
 * `private: true` keeps a post out of the listings, but the page is still built
 * and reachable by URL, as on the live site. The sidebar shows drafts only in
 * the dev server, so they are easy to reach while writing and never linked in
 * a production build.
 */
const SHOW_DRAFTS = import.meta.env.DEV;

export interface NavSection {
  name: string;
  path?: string;
  /** Sections start collapsed unless opened, matching observablehq.config.js. */
  open?: boolean;
  pages?: NavItem[];
}

/**
 * Mirrors the `pages` array in observablehq.config.js. Entries not yet ported
 * are omitted rather than left as dead links, so the spike only offers pages
 * that exist.
 */
/**
 * Ordering follows the `pages` array in observablehq.config.js:
 * now, cv, contact, market, coding, blog, lab, links, analytics, credits.
 * Entries not yet ported are omitted rather than left as dead links.
 */
const BEFORE_COLLECTIONS: NavSection[] = [
  { name: "now", path: "/now" },
  { name: "cv", path: "/cv" },
  { name: "contact", path: "/contact" },
  {
    name: "market",
    path: "/market",
    open: true,
    pages: [
      { name: "overview", path: "/market/overview" },
      { name: "heatmap", path: "/market/heatmap" },
      { name: "fed", path: "/market/fed" },
      { name: "boe", path: "/market/boe" },
    ],
  },
];

const AFTER_COLLECTIONS: NavSection[] = [
  { name: "links", path: "/links" },
  { name: "analytics", path: "/analytics" },
  { name: "credits", path: "/credits" },
];

/**
 * Reproduces ContentLoader.sidebar(): drop drafts, newest first, and label each
 * entry "<year> <name>" so the listing reads the same as the Observable site.
 */
const section = async (name: "blog" | "lab" | "coding"): Promise<NavSection> => {
  const entries = (await getCollection(name)).filter(
    (entry) => SHOW_DRAFTS || entry.data.private !== true,
  );
  const pages = entries
    .map((entry) => ({
      // Undated entries sort as today, matching entryYear, which puts them
      // in the current year's URL. Sorting them to the epoch instead listed
      // them last under a label saying otherwise.
      date: entry.data.date ? new Date(entry.data.date) : new Date(),
      title: `${entry.data.title ?? entry.id}`,
      path: entryPath(name, entry.id, entry.data.date),
      draft: entry.data.private === true,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(({ title, path, draft }) => ({ name: `${path.split("/")[2]} ${title}`, path, draft }));
  return { name, path: `/${name}`, open: false, pages };
};

export const navigation = async (): Promise<NavSection[]> => [
  ...BEFORE_COLLECTIONS,
  await section("coding"),
  await section("blog"),
  await section("lab"),
  ...AFTER_COLLECTIONS,
];
