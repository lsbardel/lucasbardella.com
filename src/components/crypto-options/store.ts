import { useStore } from "@nanostores/react";
import * as d3 from "d3";
import * as React from "react";
import { atom } from "nanostores";

/**
 * The crypto options post is a chain of Observable cells that all referenced
 * one `asset` cell, so changing the selector re-ran the spot header, the term
 * structure table, the rate chart, the smile and the options table.
 *
 * Astro has no such runtime, and the prose between those pieces has to stay in
 * the markdown, so each piece is its own island and they share the selection
 * through a store. Islands on one page share module state, which is what makes
 * this work.
 */
export const $asset = atom<"BTC" | "ETH">("ETH");
export const $maturity = atom<string>("All");

export interface TermRow {
  maturity: string;
  ttm: number;
  forward: number;
  basis: number;
  rate_percent: number;
  open_interest: number;
  volume: number;
}

export interface OptionRowData {
  strike: number;
  forward: number;
  maturity: string;
  moneyness: number;
  moneyness_ttm: number;
  ttm: number;
  implied_vol: number;
  price: number;
  type: string;
  side: string;
  open_interest: number;
  volume: number;
}

export interface AssetData {
  ts: TermRow[];
  ops: OptionRowData[];
  spot: { timestamp: string; spot: number };
}

/** Replaces the six FileAttachment cells, one fetch per asset, kept after the first. */
const cache = new Map<string, Promise<AssetData>>();

const load = (asset: string): Promise<AssetData> => {
  const existing = cache.get(asset);
  if (existing) return existing;
  const key = asset.toLowerCase();
  const csv = <T,>(name: string) =>
    fetch(`/data/options/${key}-${name}.csv`)
      .then((response) => response.text())
      .then((text) => d3.csvParse(text, d3.autoType) as unknown as T[]);
  const pending = Promise.all([
    csv<TermRow>("ts"),
    csv<OptionRowData>("ops"),
    fetch(`/data/options/${key}-spot.json`).then((response) => response.json()),
  ]).then(([ts, ops, spot]) => ({ ts, ops, spot: { ...spot, spot: Number(spot.spot) } }));
  cache.set(asset, pending);
  return pending;
};

/** The selected asset's data, or null while it is still loading. */
export const useAssetData = (): { asset: string; data: AssetData | null } => {
  const asset = useStore($asset);
  const [data, setData] = React.useState<AssetData | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    setData(null);
    load(asset).then((loaded) => !cancelled && setData(loaded));
    return () => {
      cancelled = true;
    };
  }, [asset]);
  return { asset, data };
};

export const formatTime = d3.timeFormat("%d %b %Y %H:%M:%S");
export const formatDate = d3.timeFormat("%d %b %Y");
export const fwd = d3.format(",.2f");
export const ttm = d3.format(".3f");
