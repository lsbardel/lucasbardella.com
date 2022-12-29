import { CmsListLayout, Page } from "@metablock/react";
import Typography from "@mui/material/Typography";
import React from "react";
import { darkTheme } from "../theme";
import Container from "./Container";
import Parallax from "./Parallax";

const CmsList = (props: any) => {
  const { title, image, opacity = 1, theme, ...extra } = props;
  return (
    <>
      <Parallax small photo={image} opacity={opacity} theme={theme}>
        <Container>
          <Typography component="h1" variant="h3" align="center" color="textPrimary">
            {title}
          </Typography>
        </Container>
      </Parallax>
      <Container>
        <CmsListLayout {...extra} />
      </Container>
    </>
  );
};

export const BlogList = (props: any) => {
  return (
    <Page title="Luca Blog" description="Writing about tech finance and betting">
      <CmsList title="Blog" theme={darkTheme} image="sfgH9dXcMRw" {...props} />
    </Page>
  );
};

export const LabList = (props: any) => {
  return (
    <Page title="Luca Lab" description="Technical articles with live code in javascript and python">
      <CmsList title="Lab" image="ooR1jY2yFr4" opacity={0.2} {...props} />
    </Page>
  );
};

export default CmsList;
