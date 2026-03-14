import * as React from "npm:react";

interface ImageUrls {
  thumbnail: string;
  small: string;
  regular: string;
  large: string;
}

export const HeroImage = ({ urls, blur, opacity = 0.7, children }: { urls: ImageUrls | undefined; blur?: string; opacity?: number; children?: React.ReactNode }) => {
  const thumbnailRef = React.useRef<HTMLImageElement>(null);
  const regularRef = React.useRef<HTMLImageElement>(null);
  const [thumbnailLoaded, setThumbnailLoaded] = React.useState(false);
  const [regularLoaded, setRegularLoaded] = React.useState(false);

  React.useEffect(() => {
    setThumbnailLoaded(thumbnailRef.current?.complete ?? false);
    setRegularLoaded(regularRef.current?.complete ?? false);
  }, [urls]);

  const imgStyle = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundPosition: "center center" };
  return (
    <>
      {urls && <>
          <img
            ref={thumbnailRef}
            src={urls.thumbnail}
            alt="Image"
            className={`object-cover${blur ? ` ${blur}` : ""}`}
            style={{ ...imgStyle, transition: "opacity 0.5s", opacity: thumbnailLoaded && !regularLoaded ? opacity : 0 }}
            onLoad={() => setThumbnailLoaded(true)}
          />
          <img
            ref={regularRef}
            src={urls.regular}
            alt="Image"
            className={`object-cover${blur ? ` ${blur}` : ""}`}
            style={{ ...imgStyle, transition: "opacity 0.5s", opacity: regularLoaded ? opacity : 0 }}
            onLoad={() => setRegularLoaded(true)}
          />
        </>}
      {children}
    </>
  );
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  date?: string;
  urls: ImageUrls | undefined;
  blur?: string;
  opacity?: number;
  textColor?: string;
}

export const PageHeader = ({ title, subtitle, date, urls, blur, opacity, textColor = "#fff" }: PageHeaderProps) => {
  const innerStyle = { position: "absolute" as const, top: 0, left: 0, bottom: 0, right: 0 };
  const textStyle = {
    ...innerStyle,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    padding: "1rem",
  };
  return (
    <HeroImage urls={urls} blur={blur} opacity={opacity}>
      <div style={textStyle}>
        <h1 style={{ color: textColor, margin: 0, fontSize: "clamp(1.4rem, 4vw, 2.8rem)", fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: textColor, opacity: 0.85, margin: "0.6rem 0 0", fontSize: "clamp(0.9rem, 2vw, 1.2rem)" }}>
            {subtitle}
          </p>
        )}
        {date && (
          <p style={{ color: textColor, opacity: 0.7, margin: "0.4rem 0 0", fontSize: "clamp(0.75rem, 1.5vw, 1rem)" }}>
            {date}
          </p>
        )}
      </div>
    </HeroImage>
  );
};
