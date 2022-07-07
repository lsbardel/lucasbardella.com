import { dateFormat } from "@metablock/cms";
import { Page } from "@metablock/react";
import Typography from "@mui/material/Typography";
import React from "react";
import { darkTheme, lightTheme } from "../theme";
import Container from "./Container";
import Markdown from "./Notebook";
import Parallax from "./Parallax";

const CmsPageEntry = (props: any) => {
  const {
    tagline,
    hero_photo,
    hero_opacity,
    hero_photo_filter,
    hero_dark,
    highlight_style,
    ...extra
  } = props;
  const theme = hero_dark ? darkTheme : lightTheme;
  const highlightStyle = highlight_style || "github";
  const formatDate = props.date instanceof Date ? ` on ${dateFormat()(props.date)}` : "";
  return (
    <Page {...extra} prefix={false}>
      <Parallax
        photo={hero_photo}
        filter={hero_photo_filter}
        opacity={hero_opacity}
        maxWidth="md"
        theme={theme}
        small
      >
        <Typography component="h1" variant="h3" align="center" paragraph color="textPrimary">
          {tagline || props.title}
        </Typography>
        {props.author ? (
          <Typography component="h5" variant="subtitle2" align="center" paragraph>
            by {props.author}
            {formatDate}
          </Typography>
        ) : null}
        {props.description ? (
          <Typography component="p" variant="subtitle1" align="center" color="textPrimary">
            {props.description}
          </Typography>
        ) : null}
      </Parallax>
      <Container>
        <Markdown highlightStyle={highlightStyle} {...props} />
      </Container>
    </Page>
  );
};

export default CmsPageEntry;