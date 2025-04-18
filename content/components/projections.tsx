import * as React from "npm:react";

const projectionOptions = [
  { name: "equirectangular", description: "The equirectangular, or plate carrée, projection" },
  { name: "orthographic", description: "The orthographic projection" },
  { name: "stereographic", description: "The stereographic projection" },
  { name: "mercator", description: "The Mercator projection" },
  { name: "equal-earth", description: "The Equal Earth projection by Šavrič et al." },
  { name: "azimuthal-equal-area", description: "The azimuthal equal-area projection" },
  { name: "azimuthal-equidistant", description: "The azimuthal equidistant projection" },
  { name: "conic-conformal", description: "The conic conformal projection" },
  { name: "conic-equal-area", description: "The conic equal-area projection" },
  { name: "conic-equidistant", description: "The conic equidistant projection" },
  { name: "gnomonic", description: "The gnomonic projection" },
  { name: "transverse-mercator", description: "The transverse Mercator projection" },
  { name: "albers", description: "The Albers’ conic equal-area projection" },
  {
    name: "albers-usa",
    description: "A composite Albers conic equal-area projection suitable for the United States",
  },
];

export const ProjectionSelect = ({
  projection,
  onChange,
}: {
  projection: string;
  onChange: any;
}) => {
  const [currentProjection, setProjection0] = React.useState(projection); // State for projection type

  const setProjection = (newProjection: string) => {
    setProjection0(newProjection);
    onChange(newProjection);
  };
  React.useEffect(() => {
    onChange(currentProjection);
  }, [currentProjection, onChange]);

  return (
    <div className="mb-4">
      <label htmlFor="projection-select" className="block text-sm font-medium text-gray-300 mb-2">
        Projection
      </label>
      <select
        id="projection-select"
        value={currentProjection}
        onChange={(e) => setProjection(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        {projectionOptions.map((option) => (
          <option key={option.name} value={option.name}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};
