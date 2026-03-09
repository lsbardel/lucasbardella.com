import * as React from "npm:react";

interface ImageUrls {
  thumbnail: string;
  small: string;
  regular: string;
  large: string;
}

export const HeroImage = ({ urls, blur, opacity = 0.7, children }: { urls: ImageUrls | undefined; blur?: string; opacity?: number; children?: React.ReactNode }) => {
  const [thumbnailLoaded, setThumbnailLoaded] = React.useState(false);
  const [regularLoaded, setRegularLoaded] = React.useState(false);

  React.useEffect(() => {
    setThumbnailLoaded(false);
    setRegularLoaded(false);
  }, [urls]);

  const imgStyle = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundPosition: "center center" };
  return (
    <>
      {urls && <>
          <img
            src={urls.thumbnail}
            alt="Image"
            className={`object-cover${blur ? ` ${blur}` : ""}`}
            style={{ ...imgStyle, transition: "opacity 0.5s", opacity: thumbnailLoaded && !regularLoaded ? opacity : 0 }}
            onLoad={() => setThumbnailLoaded(true)}
          />
          <img
            src={urls.regular}
            alt="Image"
            className="object-cover"
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
  urls: ImageUrls | undefined;
  blur?: string;
  opacity?: number;
}

export const PageHeader = ({ title, subtitle, urls, blur, opacity }: PageHeaderProps) => {
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
        <h1 style={{ color: "#fff", margin: 0, fontSize: "clamp(1.4rem, 4vw, 2.8rem)", fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: "rgba(255,255,255,0.85)", margin: "0.6rem 0 0", fontSize: "clamp(0.9rem, 2vw, 1.2rem)" }}>
            {subtitle}
          </p>
        )}
      </div>
    </HeroImage>
  );
};
