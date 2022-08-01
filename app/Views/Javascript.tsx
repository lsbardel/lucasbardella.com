import { isSsr, useWindowSize } from "@metablock/react";
import Box from "@mui/material/Box";
import React from "react";

const Javascript = (props: any) => {
  const { baseUrl, js } = props;
  const { aspectRatio = "50%", module, ...options } = js;
  const mod = React.useRef<any>();
  const ref = React.useRef<HTMLDivElement>();
  let script = module;
  if (script && script.substring(0, 2) === "./") script = `${baseUrl}/${script.substring(2)}`;
  // make sure to re-render when offsetWidth change
  useWindowSize(() => {
    if (!ref.current) return;
    return ref.current.offsetWidth;
  });
  const setRef = async (element: HTMLDivElement) => {
    ref.current = element;
    if (!isSsr() && script) {
      if (!mod.current) {
        mod.current = await import(/* webpackIgnore: true */ script);
      }
      mod.current.default(element, options);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        paddingTop: aspectRatio,
      }}
    >
      <Box sx={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }} ref={setRef}></Box>
    </Box>
  );
};

export default Javascript;
