import { useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Markdown } from "@metablock/cms";
import { compileOptions, NoSsr } from "@metablock/core";
import "katex/dist/katex.min.css";
import React from "react";
//@ts-ignore
import { BlockMath, InlineMath } from "react-katex";
//@ts-ignore
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
//@ts-ignore
import RemarkMathPlugin from "remark-math";
import Javascript from "./Javascript";

const PageMarkdown = (props: any) => {
  const theme = useTheme();
  const renderers = {
    //math: (p: any) => <BlockMath math={p.value} />,
    inlineMath: (p: any) => <InlineMath math={p.value} />,
    math: (p: any) => <Module {...props} {...p} />,
  };
  const style = { ...coy };
  const pre = {
    ...style[`pre[class*="language-"]`],
    overflowX: "auto",
    padding: theme.spacing(1),
  };
  style[`pre[class*="language-"]`] = pre;
  return <Markdown {...props} plugins={[RemarkMathPlugin]} style={style} renderers={renderers} />;
};

const Module = (props: any) => {
  const { value, ...extra } = props;
  if (value.substring(0, 7) !== "module:")
    return (
      <NoSsr>
        <BlockMath math={value} />
      </NoSsr>
    );
  else {
    try {
      return <Javascript {...compileOptions(value)} {...extra} />;
    } catch (exc) {
      return <Error exc={exc} />;
    }
  }
};

const Error = (props: any) => {
  const exc = "" + props.exc;
  return (
    <Typography component="p" variant="h5" paragraph color="error">
      {exc}
    </Typography>
  );
};

export default PageMarkdown;
