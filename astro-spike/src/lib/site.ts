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
};

/** Path of the source file on GitHub, mirroring the old footer's link. */
export const sourceUrl = (contentPath: string | undefined): string | undefined =>
  contentPath ? `${site.homepage}/blob/main/${contentPath}` : undefined;
