import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { Page, Parallax } from "@metablock/react";
import "highlight.js/styles/github.css";
import React from "react";
import maxWidth from "./width";

const SimpleEntry = (props: any) => {
  return (
    <Page title={props.title} description={props.description} prefix={false}>
      <Parallax small>
        <Container maxWidth={maxWidth}>
          <Typography component="h1" variant="h3" align="center" paragraph>
            {props.tagline || props.title}
          </Typography>
          {props.description ? (
            <Typography component="p" variant="subtitle1" align="center">
              {props.description}
            </Typography>
          ) : null}
        </Container>
      </Parallax>
      <Container maxWidth={maxWidth}>
        <Box pt={3} pb={4}>
          <Typography variant="body1">
            <div dangerouslySetInnerHTML={{ __html: props.htmlBody }}></div>
          </Typography>
        </Box>
      </Container>
    </Page>
  );
};

export default SimpleEntry;
