import Typography from "@material-ui/core/Typography";
import { Page, Parallax } from "@metablock/react";
import React from "react";
import { ListLayout } from "../../metablock-js/packages/metablock-cms/src";
import Container from "./Container";

const CmsList = (props: any) => {
  const { title, image, ...extra } = props;
  return (
    <>
      <Parallax small image={image}>
        <Container>
          <Typography component="h1" variant="h3" align="center">
            {title}
          </Typography>
        </Container>
      </Parallax>
      <Container>
        <ListLayout {...extra} />
      </Container>
    </>
  );
};

export const BlogList = (props: any) => {
  return (
    <Page title="Luca Blog" description="Writing about tech finance and betting">
      <CmsList title="Blog" {...props} />
    </Page>
  );
};

export const LabList = (props: any) => {
  return (
    <Page
      title="Luca Lab"
      description="Tachnical articheles with live code in javascript and python"
    >
      <CmsList title="Lab" {...props} />
    </Page>
  );
};

export default CmsList;
