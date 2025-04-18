import * as Plot from "npm:@observablehq/plot";
import * as React from "npm:react";
import { feature } from "npm:topojson-client"; // Import feature from topojson-client
import { ProjectionSelect } from "./projections.js"; // Import ProjectionSelect componen

const countryName = (name: string) => {
  // Function to format country names
  const nameMap: { [key: string]: string } = {
    "United States of America": "United States",
    "Dem. Rep. Congo": "Congo (Democratic Republic of)",
  };
  return nameMap[name] || name;
};

const availableStats = [
  { name: "Country Risk Factors", key: "countryRiskPremium" },
  { name: "Total Equity Risk Premium", key: "totalEquityRiskPremium" },
];

const statsMap = availableStats.reduce((acc, d) => {
  acc[d.key] = d;
  return acc;
}, {});

export const CountryStats = ({
  countries,
  stats,
  aspectRatio,
}: {
  countries: any;
  stats: any[];
  aspectRatio: string;
}) => {
  const el = React.useRef(null);
  const [projection, setProjection] = React.useState("equal-earth"); // State for projection type
  const [selectedStat, setSelectedStat] = React.useState(statsMap.countryRiskPremium); // State for selected stat
  const style = { width: "100%", position: "relative", paddingTop: aspectRatio };
  const styleInner = { position: "absolute", top: 0, left: 0, bottom: 0, right: 0 };
  React.useEffect(() => {
    plotCountryStats(el.current, stats, countries, projection, selectedStat);
  }, [stats, countries, projection, selectedStat]);

  return (
    <div>
      <div class="grid grid-cols-2 gap-4">
      <div className="mb-4">
        <ProjectionSelect projection={projection} onChange={setProjection} />
      </div>
      <div className="mb-4">
        <label
          htmlFor="stat-select"
          className="block text-sm font-medium text-gray-300 mb-2" // Updated for dark theme
        >
          Select Statistic:
        </label>
        <select
          id="stat-select"
          value={selectedStat.key}
          onChange={(e) => setSelectedStat(statsMap[e.target.value])}
          className="block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" // Updated for dark theme
        >
          {availableStats.map((stat) => (
            <option key={stat.key} value={stat.key}>
              {stat.name}
            </option>
          ))}
        </select>
      </div>
      </div>
      <div className="container-outer" style={style}>
        <div className="container" ref={el} style={styleInner}></div>
      </div>
    </div>
  );
};

const plotCountryStats = (el, stats, world, projection, selectedStat) => {
  if (!el) return;

  // Convert TopoJSON to GeoJSON
  const worldGeoJSON = feature(world, world.objects.countries);

  // Map country names to their selected statistic
  const countryRiskData = stats.reduce((acc, d) => {
    acc[d.country] = d;
    return acc;
  }, {});

  // Create the plot
  const plot = Plot.plot({
    projection: {
      type: projection,
    }, // Use the selected projection
    marks: [
      Plot.graticule(),
      Plot.geo(worldGeoJSON, { fill: "lightgray", stroke: "white" }), // Base map
      Plot.geo(worldGeoJSON, {
        fill: (d) => {
          const name = countryName(d.properties.name);
          const countryData = countryRiskData[name];
          return countryData ? countryData[selectedStat.key] : 0;
        },
        stroke: "gray",
        title: (d) => {
          const name = countryName(d.properties.name);
          const countryData = countryRiskData[name];
          return countryData ? `${name}: ${countryData[selectedStat.key]}` : `${name} - no data`;
        },
      }),
      Plot.sphere(),
    ],
    color: {
      type: "log", // Use a logarithmic scale
      label: selectedStat.name,
      domain: [1, Math.max(...stats.map((d) => d[selectedStat.key]))], // Avoid zero in log scale
      scheme: "reds",
      legend: true,
    },
    width: el.offsetWidth,
    height: el.offsetHeight,
  });

  // Clear previous plot and append the new one
  el.innerHTML = "";
  el.appendChild(plot);
};
