import * as d3 from "d3";
import * as React from "react";
import { CountryStats } from "./country-risk";
import { useRemote } from "./inputs";

/**
 * Replaces the Observable pair
 *
 *   const stats = FileAttachment("../../data/country-stats.csv").csv({typed: true});
 *   const countries = fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/.../countries-110m.json")...
 *
 * The topology comes from public/ rather than the CDN: it is the same
 * world-atlas file the Observable data loader already downloaded at build time,
 * so the page no longer depends on jsdelivr being reachable when it is opened.
 */
const CountryStatsDemo = () => {
  const stats = useRemote("/data/country-stats.csv", (text) => d3.csvParse(text, d3.autoType));
  const countries = useRemote("/data/world-110m.json", (text) => JSON.parse(text));
  if (!stats || !countries) return <p>Loading country statistics…</p>;
  return <CountryStats countries={countries} stats={stats} aspectRatio="70%" />;
};

export default CountryStatsDemo;
