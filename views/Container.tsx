import MuiContainer from "@material-ui/core/Container";
import React from "react";

const Container = (props: any) => {
  const { maxWidth = "md", children } = props;
  return <MuiContainer maxWidth={maxWidth}>{children}</MuiContainer>;
};

export default Container;
