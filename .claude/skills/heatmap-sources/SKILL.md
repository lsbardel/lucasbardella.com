# Refresh Heatmap Markets

Refreshes the market list used by the market heatmap page at `/market/heatmap`.

## What this is

`content/components/heatmap-sources.ts` is a **generated** file holding every market
the TradingView stock heatmap supports, grouped by country. It is committed to the
repo and read at runtime, nothing is fetched in the browser.

TradingView publishes no API and no documentation for this list. The generator
extracts it from the widget's own iframe bundle, which ships the `DataSets` enum,
a description map and a dataset to country map, with the "All <country>" labels
resolved against the English locale bundle.

## The silent fallback, read this first

The `DataSets` enum is shared across the stock, ETF and crypto heatmaps, and the
stock widget **silently renders S&P 500 for anything it cannot serve**. There is
no error, so an unsupported market looks like "the chart did not update" rather
than a bad identifier. About half the enum behaves this way: of 213 stock
datasets only 111 actually load, and the FTSE 100, CAC 40, Nikkei 225 and the
STOXX indices are all among the broken ones.

So the market list is the intersection of two things:

- `lsts/heatmap-candidates.json`, everything the bundle offers (generated)
- `lsts/heatmap-verified.json`, what actually loads (browser checked)

Never add a market by hand on the strength of it being in the enum. If it is not
verified, the page will quietly show the wrong index.

## How to refresh

```bash
make heatmap-sources     # fast, re-extracts from the bundle
```

If TradingView may have added or fixed markets, revalidate too:

```bash
make heatmap-validate    # slow, needs Chrome, several minutes
make heatmap-sources     # re-apply the refreshed verified list
```

`heatmap-validate` renders every candidate in headless Chrome and compares the
dataset name in the widget's top bar against the expected label, which is the
only reliable oracle: the heatmap is a canvas inside a cross origin iframe, so
the check reads the iframe's own DevTools target. It refuses to write an empty
result, so a failed run cannot wipe the committed list.

Do not edit `content/components/heatmap-sources.ts` by hand, the next refresh
overwrites it. Edit `lsts/heatmap-sources.ts` instead.

The script prints what changed, for example:

```
213 markets across 64 groups
added: NEWMARKET
removed: OLDMARKET
```

Report the added and removed markets to the user, and commit the regenerated file
only if something actually changed.

## When it fails

The script validates before writing and leaves the committed list untouched on
failure, so a broken scrape can never produce an empty or truncated dropdown.
It fails when:

- no bundle declares the `DataSets` enum
- the enum does not contain `SPX500`, meaning the wrong enum was read
- a market has no resolvable label
- fewer than 180 markets are extracted
- there is no United States group

All of these mean TradingView changed their bundle structure, so `lsts/heatmap-sources.ts`
needs updating. Bundle names are content hashed and the minified variable names change
on every TradingView deploy, so everything is discovered at runtime rather than hardcoded.
Watch out for two traps that have already bitten this parser:

- minified module ids can be exponent literals, `381e3` rather than `381000`
- short minified names such as `a` are reused many times in one bundle, so always
  search forward from a known anchor rather than taking the first match

## Related

- `content/components/market-heatmap.tsx` renders the controls and keeps the choices
  in the query string
- `content/market/heatmap.md` is the page itself
