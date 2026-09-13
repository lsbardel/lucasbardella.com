import * as React from "react";
import { Color, Controls, Range, Select, Toggle } from "./inputs";
import CirclesLogo, { type CirclesLogoProps } from "./logo/circles";

const CLIP_MODES = ["none", "outer", "inner", "petals"] as const;

/** Replaces the eight Observable inputs that drove the circles logo generator. */
const LogoCirclesDemo = () => {
  const [petals, setPetals] = React.useState(8);
  const [rotation, setRotation] = React.useState(0);
  const [strokeColor, setStrokeColor] = React.useState("#97d8eb");
  const [strokeWidth, setStrokeWidth] = React.useState(3);
  const [opacity, setOpacity] = React.useState(1);
  const [clip, setClip] = React.useState("none");
  const [innerRadius, setInnerRadius] = React.useState(0.675);
  const [fillPetals, setFillPetals] = React.useState(false);
  const [showChords, setShowChords] = React.useState(false);

  return (
    <>
      <Controls>
        <div>
          <Range label="Petals" value={petals} onChange={setPetals} min={3} max={12} step={1} />
          <Range label="Rotation (deg)" value={rotation} onChange={setRotation} min={0} max={360} step={1} />
          <Color label="Color" value={strokeColor} onChange={setStrokeColor} />
          <Range label="Stroke width" value={strokeWidth} onChange={setStrokeWidth} min={0.5} max={10} step={0.5} />
          <Range label="Opacity" value={opacity} onChange={setOpacity} min={0} max={1} step={0.05} />
        </div>
        <div>
          <Select label="Clip mode" value={clip} onChange={setClip} options={CLIP_MODES} />
          <Range label="Inner radius" value={innerRadius} onChange={setInnerRadius} min={0} max={1} step={0.01} />
          <Toggle label="Fill petals" value={fillPetals} onChange={setFillPetals} />
          <Toggle label="Show chords" value={showChords} onChange={setShowChords} />
        </div>
      </Controls>
      <CirclesLogo
        petals={petals}
        rotation={rotation}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        opacity={opacity}
        clip={clip as CirclesLogoProps["clip"]}
        innerRadius={innerRadius}
        fillPetals={fillPetals}
        showChords={showChords}
        size={600}
      />
    </>
  );
};

export default LogoCirclesDemo;
