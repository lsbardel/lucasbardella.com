import React from "react";

interface BackgroundProps {
  loaders?: Record<string, any>;
  children: any;
  Component: any;
  image: string;
}

const Background = (props: BackgroundProps) => {
  const { Component, children, loaders, image, ...extra } = props;
  let imageLoading = image;

  if (loaders) {
    const bits = image.split(":");
    const loader = loaders[bits.length > 1 ? bits[0] : ""];
    if (loader) {
      imageLoading = loader(bits.splice(1).join(":"));
    }
  }

  return (
    <Component image={imageLoading} {...extra}>
      {children}
    </Component>
  );
};

export default Background;
