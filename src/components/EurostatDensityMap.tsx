import * as React from "react";

const YEARS = Array.from({ length: 23 }, (_, index) => String(2023 - index));

const initialYear = (): string => {
  if (typeof window === "undefined") return YEARS[0];
  return new URLSearchParams(window.location.search).get("year") ?? YEARS[0];
};

/**
 * Replaces the Observable cells that built the choropleth:
 *
 *   const year = view(Inputs.select(range, {label: "Year", value: currentYear}));
 *   eurostatmap.map("choropleth").width(width).subtitle(year)
 *     .stat({eurostatDatasetCode: "demo_r_d3dens", filters: {TIME: year}})
 *     .legend(...).zoomExtent([1, 10]).build();
 *
 * eurostat-map draws into an existing `<svg id="map">` and fetches its own data
 * from Eurostat, so the port keeps that shape and rebuilds on each change. The
 * library is imported inside the effect because it touches `document` at module
 * scope, which would break the static build if it ran during SSR.
 */
const EurostatDensityMap = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [year, setYear] = React.useState(initialYear);

  // The old page kept the choice in the query string so a view was shareable.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("year") === year) return;
    params.set("year", year);
    history.replaceState({}, "", `?${params.toString()}`);
  }, [year]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    import("eurostat-map").then((eurostatmap) => {
      if (cancelled || !ref.current) return;
      // Rebuilding is the only way to change the filtered year, so the previous
      // drawing is cleared first.
      ref.current.innerHTML = '<svg id="map"></svg>';
      (eurostatmap.default ?? eurostatmap)
        .map("choropleth")
        .width(ref.current.offsetWidth)
        .subtitle(year)
        .stat({
          eurostatDatasetCode: "demo_r_d3dens",
          unitText: "people/km²",
          filters: { TIME: year },
        })
        .legend({ x: 100, y: 90, title: "Density, people/km²" })
        .zoomExtent([1, 10])
        .build();
    });

    return () => {
      cancelled = true;
    };
  }, [year]);

  return (
    <div>
      <h2>{year}</h2>
      <div className="flex items-center gap-2 text-sm mb-4">
        <span className="text-[var(--foreground-faint)]">Year</span>
        <select value={year} onChange={(event) => setYear(event.target.value)}>
          {YEARS.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>
      <div ref={ref}>
        <svg id="map" />
      </div>
    </div>
  );
};

export default EurostatDensityMap;
