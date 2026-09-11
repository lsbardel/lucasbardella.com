import { type HeatmapSource, type HeatmapSourceGroup, SOURCE_GROUPS } from "./heatmap-sources";

export const findSource = (value: string): HeatmapSource | undefined => {
  for (const group of SOURCE_GROUPS) {
    const match = group.sources.find((source) => source.value === value);
    if (match) return match;
  }
  return undefined;
};

/**
 * Matching the country as well as the label and the identifier lets "italy",
 * "ftse" or "SPX" all narrow the list, which matters across 64 groups.
 * A country match keeps the whole group, so "japan" lists every Japanese market.
 */
export const filterGroups = (query: string): HeatmapSourceGroup[] => {
  const needle = query.trim().toLowerCase();
  if (!needle) return SOURCE_GROUPS;
  const groups: HeatmapSourceGroup[] = [];
  for (const group of SOURCE_GROUPS) {
    const sources = group.country.toLowerCase().includes(needle)
      ? group.sources
      : group.sources.filter(
          (source) =>
            source.label.toLowerCase().includes(needle) || source.value.toLowerCase().includes(needle),
        );
    if (sources.length > 0) groups.push({ country: group.country, sources });
  }
  return groups;
};
