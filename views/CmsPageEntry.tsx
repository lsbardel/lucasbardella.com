import Typography from "@material-ui/core/Typography";
import { dateFormat, Markdown } from "@metablock/cms";
import { Page } from "@metablock/react";
import "katex/dist/katex.min.css";
import React from "react";
//@ts-ignore
import { BlockMath, InlineMath } from "react-katex";
//@ts-ignore
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
//@ts-ignore
import RemarkMathPlugin from "remark-math";
import { darkTheme, lightTheme } from "../context/theme";
import Container from "./Container";
import Parallax from "./Parallax";
import maxWidth from "./width";

const SimpleEntry = (props: any) => {
  const { tagline, hero_photo, hero_photo_filter, hero_dark, ...extra } = props;
  const theme = hero_dark ? darkTheme : lightTheme;
  const formatDate = props.date instanceof Date ? ` on ${dateFormat()(props.date)}` : "";
  const renderers = {
    math: (p: any) => <BlockMath math={p.value} />,
    inlineMath: (p: any) => <InlineMath math={p.value} />,
  };
  const style = { ...coy };
  const pre = {
    ...style[`pre[class*="language-"]`],
    "overflow-x": "auto",
    padding: theme.spacing(1),
  };
  style[`pre[class*="language-"]`] = pre;
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
        <Markdown {...props} plugins={[RemarkMathPlugin]} style={style} renderers={renderers} />
      </Container>
    </Page>
  );
};

export default SimpleEntry;
