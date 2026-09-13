import { strFromU8, unzipSync } from "fflate";
import * as React from "react";
import Cavity from "./cfd/cavity";
import { meshFields2d } from "./cfd/mesh2d";
import { schemes } from "./palettes";

type Solution = ReturnType<typeof meshFields2d>;

/**
 * Replaces this Observable block:
 *
 *   const cavity_100 = await FileAttachment("...cavity_100.zip").zip();
 *   const solution_100 = meshFields2d(
 *     await cavity_100.file("mesh.json").json(),
 *     await cavity_100.file("fields.json").json());
 *
 * The raw JSON is 30 MB across the two cases, far too much to bundle, so each
 * case is fetched and unzipped on demand and then kept, exactly as the zip
 * FileAttachment did.
 */
const loadCase = async (re: number): Promise<Solution> => {
  const response = await fetch(`/data/cfd/cavity_${re}.zip`);
  if (!response.ok) throw new Error(`cavity_${re}.zip returned ${response.status}`);
  const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
  return meshFields2d(
    JSON.parse(strFromU8(files["mesh.json"])),
    JSON.parse(strFromU8(files["fields.json"])),
  );
};

const initialPalette = (): string => {
  if (typeof window === "undefined") return "Inferno";
  return new URLSearchParams(window.location.search).get("palette") ?? "Inferno";
};

const row = "flex items-center gap-2 text-sm text-gray-300 mb-2";
const label = "w-32 shrink-0 text-gray-400";

/**
 * The nine Observable inputs that drove the cavity plot become component state.
 * Observable re-ran the display cell whenever any of them changed; here React
 * re-renders, and `Cavity` redraws from its own effect.
 */
const CavityDemo = () => {
  const [re, setRe] = React.useState(1000);
  const [solutions, setSolutions] = React.useState<Record<number, Solution>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [time, setTime] = React.useState<number | null>(null);
  const [nParticles, setNParticles] = React.useState(1000);
  const [particleRadius, setParticleRadius] = React.useState(2.5);
  const [palette, setPalette] = React.useState(initialPalette);
  const [field, setField] = React.useState<"U" | "p">("U");
  const [showGrid, setShowGrid] = React.useState(false);
  const [showContours, setShowContours] = React.useState(false);
  const [showStreamlines, setShowStreamlines] = React.useState(false);

  const solution = solutions[re];

  React.useEffect(() => {
    if (solutions[re]) return;
    let cancelled = false;
    loadCase(re)
      .then((loaded) => !cancelled && setSolutions((prev) => ({ ...prev, [re]: loaded })))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, [re, solutions]);

  // Observable rebuilt the time slider when the case changed, which reset it to
  // the final step. Same here, since the two cases have different time ranges.
  React.useEffect(() => {
    if (solution) setTime(solution.times[solution.times.length - 1].time);
  }, [solution]);

  const times = solution?.times;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-4">
        <div>
          <div className={row}>
            <span className={label}>Re</span>
            {[100, 1000].map((value) => (
              <label key={value} className="flex items-center gap-1">
                <input type="radio" name="re" checked={re === value} onChange={() => setRe(value)} />
                {value}
              </label>
            ))}
          </div>
          <div className={row}>
            <span className={label}>Particles</span>
            <input type="range" min={100} max={2000} step={100} value={nParticles}
              onChange={(e) => setNParticles(Number(e.target.value))} />
            <span>{nParticles}</span>
          </div>
          <div className={row}>
            <span className={label}>Particle radius</span>
            <input type="range" min={1} max={6} step={0.5} value={particleRadius}
              onChange={(e) => setParticleRadius(Number(e.target.value))} />
            <span>{particleRadius}</span>
          </div>
          <div className={row}>
            <span className={label}>Time (s)</span>
            {times && time !== null ? (
              <>
                <input type="range" min={times[0].time} max={times[times.length - 1].time} step={0.1}
                  value={time} onChange={(e) => setTime(Number(e.target.value))} />
                <span>{time.toFixed(1)}</span>
              </>
            ) : (
              <span className="text-gray-500">loading…</span>
            )}
          </div>
        </div>
        <div>
          <div className={row}>
            <span className={label}>Palette</span>
            <select value={palette} onChange={(e) => setPalette(e.target.value)}>
              {Object.keys(schemes).map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div className={row}>
            <span className={label}>Field</span>
            {(["U", "p"] as const).map((value) => (
              <label key={value} className="flex items-center gap-1">
                <input type="radio" name="field" checked={field === value} onChange={() => setField(value)} />
                {value}
              </label>
            ))}
          </div>
          {([
            ["Show grid", showGrid, setShowGrid],
            ["Show contours", showContours, setShowContours],
            ["Show streamlines", showStreamlines, setShowStreamlines],
          ] as const).map(([text, value, set]) => (
            <div className={row} key={text}>
              <span className={label}>{text}</span>
              <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400">Could not load the simulation: {error}</p>}
      {!error && !solution && <p className="text-gray-500">Loading the Re = {re} simulation…</p>}
      {solution && time !== null && (
        <Cavity
          mesh={solution.mesh}
          times={solution.times}
          time={time}
          nParticles={nParticles}
          particleRadius={particleRadius}
          palette={palette}
          field={field}
          showGrid={showGrid}
          showContours={showContours}
          showStreamlines={showStreamlines}
          aspectRatio="100%"
        />
      )}
    </div>
  );
};

export default CavityDemo;
