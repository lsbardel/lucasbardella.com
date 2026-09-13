import * as React from "react";
import FlowField from "./flow-field";
import { Controls, Range, Select } from "./inputs";
import { schemes } from "./palettes";

/** The background choice mapped to a canvas colour, as the display cell did. */
const BACKGROUNDS: Record<string, string> = {
  transparent: "transparent",
  dark: "#0a0a0f",
  light: "#f5f5f5",
};

/** Replaces the six Observable inputs that drove the flow field. */
const FlowFieldDemo = () => {
  const [particleCount, setParticleCount] = React.useState(3000);
  const [speed, setSpeed] = React.useState(1.2);
  const [noiseScale, setNoiseScale] = React.useState(0.0035);
  const [trailFade, setTrailFade] = React.useState(10);
  const [scheme, setScheme] = React.useState("Viridis");
  const [background, setBackground] = React.useState("transparent");

  return (
    <>
      <Controls>
        <div>
          <Range label="Particles" value={particleCount} onChange={setParticleCount} min={500} max={8000} step={500} />
          <Range label="Speed" value={speed} onChange={setSpeed} min={0.3} max={4} step={0.1} />
          <Range label="Noise scale" value={noiseScale} onChange={setNoiseScale} min={0.001} max={0.02} step={0.0005} />
        </div>
        <div>
          <Range label="Trail length" value={trailFade} onChange={setTrailFade} min={1} max={30} step={1} />
          <Select label="Palette" value={scheme} onChange={setScheme} options={Object.keys(schemes)} />
          <Select label="Background" value={background} onChange={setBackground} options={Object.keys(BACKGROUNDS)} />
        </div>
      </Controls>
      <FlowField
        particleCount={particleCount}
        speed={speed}
        noiseScale={noiseScale}
        trailFade={trailFade}
        colors={schemes[scheme]}
        background={BACKGROUNDS[background]}
      />
    </>
  );
};

export default FlowFieldDemo;
