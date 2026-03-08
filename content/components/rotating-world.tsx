import * as d3 from "npm:d3";
import * as topojson from "npm:topojson-client";
import * as React from "npm:react";

interface WorldTopo {
  objects: {
    land: topojson.GeometryObject;
    countries: topojson.GeometryObject;
  };
}

interface Props {
  world: WorldTopo;
  speed?: number;       // rotations per minute
  initialLng?: number;  // starting longitude
  sea?: string;
  land?: string;
  stroke?: string;
  aspectRatio?: string;
}

const RotatingWorld = ({
  world,
  speed = 2,
  initialLng = -40,
  sea = "#5498ec",
  land = "#ed864b",
  stroke = "#662506",
  aspectRatio = "70%",
}: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !world) return;

    const dpr = window.devicePixelRatio || 1;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const radius = Math.min(width, height) * 0.45;

    const canvas = document.createElement("canvas");
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.cssText = `width:${width}px;height:${height}px;display:block`;
    el.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const projection = d3.geoOrthographic()
      .clipAngle(90)
      .scale(radius)
      .translate([width / 2, height / 2]);

    const pathGen = d3.geoPath(projection, ctx);

    const globe = { type: "Sphere" } as GeoJSON.GeoJsonObject;
    const landFeature = topojson.feature(world as unknown as TopoJSON.Topology, world.objects.land);
    const countryFeature = topojson.feature(world as unknown as TopoJSON.Topology, world.objects.countries);
    const graticule = d3.geoGraticule()();

    let lng = initialLng;
    let lastTime = 0;
    let rafId: number;

    const draw = (now: number) => {
      const delta = lastTime ? (360 * speed * (now - lastTime)) / 60000 : 0;
      lastTime = now;
      lng += delta;
      projection.rotate([lng, 0]);

      ctx.clearRect(0, 0, width, height);

      // Sea
      ctx.beginPath();
      pathGen(globe);
      ctx.fillStyle = sea;
      ctx.fill();

      // Land
      ctx.beginPath();
      pathGen(landFeature);
      ctx.fillStyle = land;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Graticule
      ctx.beginPath();
      pathGen(graticule);
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Country borders
      ctx.beginPath();
      pathGen(countryFeature);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 0.3;
      ctx.stroke();

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      el.innerHTML = "";
    };
  }, [world, speed, initialLng, sea, land, stroke]);

  const style = { width: "100%", position: "relative" as const, paddingTop: aspectRatio };
  const innerStyle = { position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0 };

  return (
    <div style={style}>
      <div ref={ref} style={innerStyle} />
    </div>
  );
};

export default RotatingWorld;
