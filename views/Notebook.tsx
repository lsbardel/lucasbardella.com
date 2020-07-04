import { makeStyles, Theme } from "@material-ui/core/styles";
import { Notebook } from "@metablock/notebook";
import { isSsr, useWindowSize } from "@metablock/react";
import React from "react";
export {};

declare global {
  interface Window {
    notebook: Notebook;
  }
}

const useStyles = makeStyles((theme: Theme) => ({
  markdown: (props: any) => {
    const { anchor = "primary" } = props;
    const palette: any = theme.palette;
    return {
      "& p": {
        fontSize: theme.typography.body1.fontSize,
        fontFamily: theme.typography.body1.fontFamily,
      },
      "& a": {
        textDecoration: "none",
        color: palette[anchor].main,
      },
      "& pre": {
        overflowX: "auto",
        fontSize: theme.typography.body1.fontSize,
      },
      "& blockquote": {
        fontStyle: "italic",
        color: palette.text.secondary,
      },
    };
  },
}));

const Book = (props: any) => {
  const { body, ...extra } = props;
  const classes = useStyles();
  const noteRef = React.useRef<Notebook>(new Notebook());
  const ref = React.useRef<HTMLDivElement>();
  const notebook = noteRef.current;
  // make sure to re-render when offsetWidth change
  useWindowSize(() => {
    if (!ref.current) return;
    return ref.current.offsetWidth;
  });
  const setRef = async (element: HTMLDivElement) => {
    ref.current = element;
    window.notebook = notebook;
    if (element)
      await notebook.render(body, element, { ...extra, isSsr: isSsr() });
  };
  return <div className={classes.markdown} ref={setRef} />;
};

export default Book;
