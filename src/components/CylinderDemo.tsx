import * as React from "react";
import Cylinder from "./cylinder";
import { Controls, Range, Select } from "./inputs";
import { schemes } from "./palettes";

/**
 * Replaces the five Observable inputs that drove the potential flow plot,
 * laid out in the same two columns as the original `grid grid-cols-2` block.
 */
const CylinderDemo = () => {
  const [radius, setRadius] = React.useState(0.1);
  const [ny, setNy] = React.useState(30);
  const [palette, setPalette] = React.useState("RdBu");
  const [nParticles, setNParticles] = React.useState(1000);
  const [particleRadius, setParticleRadius] = React.useState(3);

  return (
    <>
      <Controls>
        <div>
          <Range label="Cylinder radius" value={radius} onChange={setRadius} min={0.05} max={0.4} step={0.01} />
          <Range label="Streamlines" value={ny} onChange={setNy} min={5} max={60} step={1} />
          <Select label="Palette" value={palette} onChange={setPalette} options={Object.keys(schemes)} />
        </div>
        <div>
          <Range label="Particles" value={nParticles} onChange={setNParticles} min={100} max={5000} step={10} />
          <Range label="Particle radius" value={particleRadius} onChange={setParticleRadius} min={1} max={8} step={0.5} />
        </div>
      </Controls>
      <Cylinder
        radius={radius}
        ny={ny}
        nParticles={nParticles}
        particleRadius={particleRadius}
        palette={palette}
      />
    </>
  );
};

export default CylinderDemo;
