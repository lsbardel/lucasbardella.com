import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { Parallax } from "@metablock/react";
import { timeFormat } from "d3-time-format";
import "highlight.js/styles/github.css";
import React from "react";
import { CmsData } from "./interfaces";

const SimpleEntry = (props: CmsData) => {
  const maxWidth = "md";
  const format = timeFormat("%B %d, %Y");
  return (
    <>
      <Parallax small>
        <Container maxWidth={maxWidth}>
          <Typography component="h1" variant="h3" align="center" paragraph>
            {props.title}
          </Typography>
          <Typography component="h5" variant="subtitle1" align="center" paragraph>
            by {props.author} on {format(props.date)}
          </Typography>
          {props.description ? (
            <Typography component="div" variant="h6" align="center">
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
    </>
  );
};

export default SimpleEntry;
