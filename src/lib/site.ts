/**
 * Site level values the footer needs. On the Observable side these came from
 * lsts/config.ts, which spreads package.json and reads the analytics id from
 * the environment.
 */
export const site = {
  author: "Luca Sbardella",
  homepage: "https://github.com/lsbardel/lucasbardella.com",
  /** Set by the CI build, used to link a page back to the run that produced it. */
  runId: import.meta.env.GITHUB_RUN_ID ?? process.env.GITHUB_RUN_ID ?? "",
  firstYear: 2009,
  /** Shown as the page title on its own, and appended to every other title. */
  name: "Luca Sbardella",
  url: "https://lucasbardella.com",
  /** The share card, an absolute URL because relative ones are ignored by crawlers. */
  ogImage: "https://lucasbardella.com/assets/og-image.png",
  themeColor: "#0C1018",
  adsenseAccount: "ca-pub-9518486636408101",
  /** Read from the repository root .env by astro.config.mjs, empty in local builds. */
  gaMeasurementId: process.env.GA_MEASUREMENT_ID ?? "",
};

/** "Lab | Luca Sbardella", but the home page stays just "Luca Sbardella". */
export const pageTitle = (title: string | undefined): string =>
  !title || title === site.name ? site.name : `${title} | ${site.name}`;

/** Path of the source file on GitHub, mirroring the old footer's link. */
export const sourceUrl = (contentPath: string | undefined): string | undefined =>
  contentPath ? `${site.homepage}/blob/main/${contentPath}` : undefined;
