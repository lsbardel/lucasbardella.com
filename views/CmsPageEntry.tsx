import Typography from "@material-ui/core/Typography";
import { Markdown } from "@metablock/cms";
import { Page } from "@metablock/react";
import React from "react";
import { darkTheme } from "../context/theme";
import Container from "./Container";
import Parallax from "./Parallax";
import maxWidth from "./width";

const SimpleEntry = (props: any) => {
  const { tagline, hero_photo, hero_photo_filter, hero_dark, ...extra } = props;
  const theme = hero_dark ? darkTheme : null;
  return (
    <Page {...extra} prefix={false}>
      <Parallax
        photo={hero_photo}
        filter={hero_photo_filter}
        maxWidth={maxWidth}
        theme={theme}
        small
      >
        <Typography component="h1" variant="h3" align="center" paragraph color="textPrimary">
          {tagline || props.title}
        </Typography>
        {props.description ? (
          <Typography component="p" variant="subtitle1" align="center" color="textPrimary">
            {props.description}
          </Typography>
        ) : null}
      </Parallax>
      <Container>
        <Markdown {...props} />
      </Container>
    </Page>
  );
};

export default SimpleEntry;
