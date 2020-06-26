import Container from "@material-ui/core/Container";
import React from "react";

const Main = (props: any) => {
  const { children } = props;
  return <Container maxWidth="lg">{children}</Container>;
};

export default Main;
