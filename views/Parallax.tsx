import Container from "@material-ui/core/Container";
import { ThemeProvider } from "@material-ui/core/styles";
import { Image, UnsplashCredits, useFetch } from "@metablock/react";
import clsx from "clsx";
import React from "react";
import { useStores } from "../context/stores";
import useStyles from "./styles";

interface ParallaxProps {
  photo?: string;
  opacity?: number;
  maxWidth?: any;
  className?: string;
  children: any;
  image?: string;
  filter?: number;
  small?: boolean;
  theme?: any;
}

const Parallax = (props: ParallaxProps) => {
  const {
    filter,
    photo,
    opacity,
    className = "",
    children,
    image = "",
    small,
    theme,
    maxWidth = "md",
  } = props;
  const { photoStore } = useStores();
  const classes = useStyles({
    filter,
    image,
  });
  const parallaxClasses = clsx({
    [classes.parallax]: true,
    [classes.small]: small,
    [className]: className,
  });
  const data =
    useFetch(async (): Promise<any> => {
      if (photo) return await photoStore.getPhoto(photo);
    }, photo) || null;

  const urls =
    data && data.urls
      ? [data.urls.thumb, data.urls.small, data.urls.regular, data.urls.full]
      : [];
  const inner = (
    <Container maxWidth={maxWidth} className={classes.main}>
      {children}
    </Container>
  );
  return (
    <>
      <Image className={parallaxClasses} opacity={opacity} urls={urls}>
        {filter ? <div className={classes.over}></div> : null}
        {theme ? <ThemeProvider theme={theme}>{inner}</ThemeProvider> : inner}
      </Image>
      <UnsplashCredits {...data} maxWidth={maxWidth} />
    </>
  );
};

export default Parallax;
