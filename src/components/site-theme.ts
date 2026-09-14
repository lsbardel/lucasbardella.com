import * as React from "react";

export type SiteTheme = "light" | "dark";

// The inline theme script in Base.astro resolves light, dark and system to one
// appearance and sets data-pf-theme="dark" on <html> when it is dark, updating
// it on every toggle and system change. Components follow that attribute.
const read = (): SiteTheme =>
  document.documentElement.getAttribute("data-pf-theme") === "dark" ? "dark" : "light";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-pf-theme"] });
  return () => observer.disconnect();
};

/** The resolved site theme, re-rendering whenever the reader switches it. */
export const useSiteTheme = (): SiteTheme =>
  React.useSyncExternalStore(subscribe, read, () => "dark");
