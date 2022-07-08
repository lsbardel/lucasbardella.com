import { Unsplash } from "@metablock/react";
import Container from "@mui/material/Container";
import { ThemeProvider } from "@mui/material/styles";
import React from "react";

interface ParallaxProps {
  photo: string;
  opacity?: number;
  maxWidth?: any;
  className?: string;
  children: any;
  filter?: number;
  small?: boolean;
  theme?: any;
}

const Parallax = (props: ParallaxProps) => {
  const { filter, photo, opacity, children, small, theme, maxWidth = "md" } = props;

  const inner = <Container maxWidth={maxWidth}>{children}</Container>;
  return (
    <>
      <Unsplash
        minScrollWidth={0}
        photoId={photo}
        filter={filter}
        opacity={opacity}
        credit
        small={small}
      >
        {theme ? <ThemeProvider theme={theme}>{inner}</ThemeProvider> : inner}
      </Unsplash>
    </>
  );
};

export default Parallax;
