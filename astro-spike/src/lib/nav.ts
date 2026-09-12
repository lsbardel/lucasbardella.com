import { getCollection } from "astro:content";
import { entryPath } from "./entry-path";

export interface NavItem {
  name: string;
  path: string;
  draft?: boolean;
}

/**
 * On the live site `private: true` removes a post from every listing. The spike
 * is a local evaluation, where a draft you cannot navigate to is worse than a
 * visible one, so drafts are listed and marked instead. A production port
 * should set this false so unfinished posts never ship.
 */
const SHOW_DRAFTS = true;

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
      { name: "heatmap", path: "/market/heatmap" },
      { name: "fed", path: "/market/fed" },
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
const section = async (name: "blog" | "lab"): Promise<NavSection> => {
  const entries = (await getCollection(name)).filter(
    (entry) => SHOW_DRAFTS || entry.data.private !== true,
  );
  const pages = entries
    .map((entry) => ({
      date: entry.data.date ? new Date(entry.data.date) : new Date(0),
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
  await section("blog"),
  await section("lab"),
  ...AFTER_COLLECTIONS,
];
