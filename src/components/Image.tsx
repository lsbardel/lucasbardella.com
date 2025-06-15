import React from "react";

type ImageProps = {
  srcSet: { [size: string]: string }; // e.g. { "480w": "img-480.jpg", "800w": "img-800.jpg" }
  sizes?: string; // e.g. "(max-width: 600px) 480px, 800px"
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  style?: React.CSSProperties;
};

const Image: React.FC<ImageProps> = ({
  srcSet,
  sizes,
  alt,
  className,
  loading = "lazy",
  style,
  ...props
}) => {
  // Build srcSet string: "img-480.jpg 480w, img-800.jpg 800w"
  const srcSetStr = Object.entries(srcSet)
    .map(([size, url]) => `${url} ${size}`)
    .join(", ");

  // Use the largest image as fallback src
  const fallbackSrc =
    srcSet[Object.keys(srcSet).sort((a, b) => parseInt(b) - parseInt(a))[0]] ||
    Object.values(srcSet)[0];

  return (
    <img
      src={fallbackSrc}
      srcSet={srcSetStr}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={loading}
      style={style}
      {...props}
    />
  );
};

export default Image;
