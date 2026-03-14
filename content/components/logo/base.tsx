import * as React from "npm:react";
import JSZip from "npm:jszip";

export interface BaseLogoProps {
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
}

interface LogoWrapperProps extends BaseLogoProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
}

const PNG_SIZES = [32, 64, 128, 256, 512, 1024];

const renderPng = (svgString: string, sz: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    doc.documentElement.setAttribute("width", String(sz));
    doc.documentElement.setAttribute("height", String(sz));
    const scaled = new XMLSerializer().serializeToString(doc);
    const url = URL.createObjectURL(new Blob([scaled], { type: "image/svg+xml" }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = sz;
      canvas.height = sz;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("no canvas context")); return; }
      ctx.drawImage(img, 0, 0, sz, sz);
      URL.revokeObjectURL(url);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")));
    };
    img.onerror = reject;
    img.src = url;
  });

export const LogoWrapper = ({ size = 300, strokeColor = "#10a37f", svgRef }: LogoWrapperProps) => {
  const downloadBundle = async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    const zip = new JSZip();
    zip.file("logo.svg", svgString);
    await Promise.all(
      PNG_SIZES.map(async sz => {
        const blob = await renderPng(svgString, sz);
        zip.file(`logo-${sz}x${sz}.png`, blob);
      })
    );
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logo.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const btnStyle: React.CSSProperties = {
    margin: "8px 4px 0",
    padding: "6px 16px",
    cursor: "pointer",
    border: `1px solid ${strokeColor}`,
    borderRadius: "4px",
    background: "transparent",
    color: strokeColor,
    fontSize: "13px",
  };

  return (
    <div style={{ textAlign: "center" }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block", margin: "0 auto" }}
      />
      <button style={btnStyle} onClick={downloadBundle}>Download bundle (SVG + PNG)</button>
    </div>
  );
};
