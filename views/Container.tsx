import Box from "@material-ui/core/Box";
import MuiContainer from "@material-ui/core/Container";
import React from "react";

const Container = (props: any) => {
  const { maxWidth = "md", children } = props;
  return (
    <MuiContainer maxWidth={maxWidth}>
      <Box pt={5} pb={8}>
        {children}
      </Box>
    </MuiContainer>
  );
};

export default Container;
