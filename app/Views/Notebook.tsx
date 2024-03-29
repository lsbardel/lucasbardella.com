import { Notebook, createNotebook } from "@metablock/notebook";
import { isSsr, useWindowSize } from "@metablock/react";
import Box from "@mui/material/Box";
import { Theme, useTheme } from "@mui/material/styles";
import React from "react";
import "../notebook/tradingview";
import { fontFamilyMono, getHighlightStyle } from "../theme";

const nodeBookStyle = (theme: Theme): any => {
  const anchor = "primary";
  const palette: any = theme.palette;
  return {
    "& p": {
      fontSize: theme.typography.body1.fontSize,
      fontFamily: theme.typography.body1.fontFamily,
      fontWeight: 400,
    },
    "& ul": {
      fontSize: theme.typography.body1.fontSize,
      fontFamily: theme.typography.body1.fontFamily,
      fontWeight: 400,
    },
    "& code": {
      fontSize: theme.typography.body1.fontSize,
      fontFamily: fontFamilyMono,
      fontWeight: 500,
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
};

const getNotebook = (theme: string): Notebook => {
  const notebook = createNotebook(theme);
  notebook.options.highlightStyle = getHighlightStyle(theme);
  return notebook;
};

const Book = (props: any) => {
  const { body, ...extra } = props;
  const theme = useTheme();
  const noteRef = React.useRef<Notebook>(getNotebook(theme.palette.mode));
  const ref = React.useRef<HTMLDivElement>();
  const notebook = noteRef.current;
  // make sure to re-render when offsetWidth change
  useWindowSize(() => {
    if (!ref.current) return;
    return ref.current.offsetWidth;
  });
  const setRef = async (element: HTMLDivElement) => {
    ref.current = element;
    if (element) await notebook.render(body, element, { ...extra, isSsr: isSsr() });
  };
  return <Box sx={nodeBookStyle(theme)} ref={setRef} />;
};

export default Book;
