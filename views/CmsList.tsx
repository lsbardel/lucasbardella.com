import Typography from "@material-ui/core/Typography";
import { Parallax } from "@metablock/react";
import React from "react";
import { ListLayout } from "../react/Cms";
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
  return <CmsList title="Blog" {...props} />;
};

export const LabList = (props: any) => {
  return <CmsList title="Lab" {...props} />;
};

export default CmsList;
