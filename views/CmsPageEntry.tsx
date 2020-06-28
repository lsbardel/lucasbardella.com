import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { Markdown } from "@metablock/cms";
import { Page, Parallax } from "@metablock/react";
import React from "react";
import maxWidth from "./width";

const SimpleEntry = (props: any) => {
  const { tagline, ...extra } = props;
  return (
    <Page {...extra} prefix={false}>
      <Parallax small>
        <Container maxWidth={maxWidth}>
          <Typography component="h1" variant="h3" align="center" paragraph>
            {tagline || props.title}
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
          <Markdown {...props} />
        </Box>
      </Container>
    </Page>
  );
};

export default SimpleEntry;
