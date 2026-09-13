import * as React from "react";
import { Color, Controls, Range, Select, Toggle } from "./inputs";
import VoronoiLogo, { type VoronoiLogoProps } from "./logo/voronoi";
import { schemes } from "./palettes";

const PATTERNS = ["phyllotaxis", "random", "ring", "grid"] as const;

/** Replaces the fourteen Observable inputs that drove the Voronoi logo generator. */
const LogoVoronoiDemo = () => {
  const [seeds, setSeeds] = React.useState(40);
  const [pattern, setPattern] = React.useState("phyllotaxis");
  const [strokeColor, setStrokeColor] = React.useState("#10a37f");
  const [strokeWidth, setStrokeWidth] = React.useState(1);
  const [opacity, setOpacity] = React.useState(1);
  const [showVoronoi, setShowVoronoi] = React.useState(true);
  const [showDelaunay, setShowDelaunay] = React.useState(false);
  const [showPoints, setShowPoints] = React.useState(false);
  const [showBoundary, setShowBoundary] = React.useState(true);
  const [pointRadius, setPointRadius] = React.useState(2);
  const [randomSeed, setRandomSeed] = React.useState(42);
  const [fillCells, setFillCells] = React.useState(false);
  const [fillDensity, setFillDensity] = React.useState(0.5);
  const [fillSeed, setFillSeed] = React.useState(7);
  const [palette, setPalette] = React.useState("Observable10");

  return (
    <>
      <Controls>
        <div>
          <Range label="Seeds" value={seeds} onChange={setSeeds} min={5} max={120} step={1} />
          <Select label="Pattern" value={pattern} onChange={setPattern} options={PATTERNS} />
          <Color label="Color" value={strokeColor} onChange={setStrokeColor} />
          <Range label="Stroke width" value={strokeWidth} onChange={setStrokeWidth} min={0} max={4} step={0.5} />
          <Range label="Opacity" value={opacity} onChange={setOpacity} min={0} max={1} step={0.05} />
          <Range label="Point radius" value={pointRadius} onChange={setPointRadius} min={1} max={6} step={0.5} />
          <Range label="Random seed" value={randomSeed} onChange={setRandomSeed} min={0} max={100} step={1} />
        </div>
        <div>
          <Toggle label="Show Voronoi" value={showVoronoi} onChange={setShowVoronoi} />
          <Toggle label="Show Delaunay" value={showDelaunay} onChange={setShowDelaunay} />
          <Toggle label="Show points" value={showPoints} onChange={setShowPoints} />
          <Toggle label="Show boundary" value={showBoundary} onChange={setShowBoundary} />
          <Toggle label="Fill cells" value={fillCells} onChange={setFillCells} />
          <Range label="Fill density" value={fillDensity} onChange={setFillDensity} min={0} max={1} step={0.05} />
          <Range label="Fill seed" value={fillSeed} onChange={setFillSeed} min={0} max={100} step={1} />
          <Select label="Palette" value={palette} onChange={setPalette} options={Object.keys(schemes)} />
        </div>
      </Controls>
      <VoronoiLogo
        seeds={seeds}
        pattern={pattern as VoronoiLogoProps["pattern"]}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        opacity={opacity}
        showVoronoi={showVoronoi}
        showDelaunay={showDelaunay}
        showPoints={showPoints}
        showBoundary={showBoundary}
        pointRadius={pointRadius}
        randomSeed={randomSeed}
        fillCells={fillCells}
        fillDensity={fillDensity}
        fillSeed={fillSeed}
        palette={palette}
        size={600}
      />
    </>
  );
};

export default LogoVoronoiDemo;
