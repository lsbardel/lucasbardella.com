import { makeStyles } from "@material-ui/core/styles";
import { useWindowSize } from "@metablock/react";
import React from "react";

const useStyles = makeStyles(() => ({
  module: (props: any) => ({
    width: "100%",
    position: "relative",
    paddingTop: props.aspectRatio,
  }),
  inner: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
}));

const Javascript = (props: any) => {
  const { baseUrl, aspectRatio = "50%" } = props;
  const mod = React.useRef<any>();
  const ref = React.useRef<HTMLDivElement>();
  let { module } = props;
  if (module && module.substring(0, 2) === "./") module = `${baseUrl}/${module.substring(2)}`;
  // make sure to re-render when offsetWidth change
  useWindowSize(() => {
    if (!ref.current) return;
    return ref.current.offsetWidth;
  });
  const setRef = async (element: HTMLDivElement) => {
    ref.current = element;
    if (!mod.current) {
      mod.current = await import(/* webpackIgnore: true */ module);
    }
    mod.current.default(element);
  };

  const classes = useStyles({ aspectRatio });
  return (
    <div className={classes.module}>
      <div className={classes.inner} ref={setRef}></div>
    </div>
  );
};

export default Javascript;
