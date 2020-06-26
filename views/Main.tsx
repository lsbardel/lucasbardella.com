import Avatar from "@material-ui/core/Avatar";
import Container from "@material-ui/core/Container";
import { assetUrl } from "@metablock/core";
import { Header, Link } from "@metablock/react";
import React from "react";
import { List } from "../components";
import useStyles from "../context/styles";

const links: any[] = [
  {
    text: "cv",
    to: "/cv",
  },
  {
    text: "blog",
    to: "/blog",
  },
  {
    text: "lab",
    to: "/lab",
  },
];

const Main = (props: any) => {
  const { children, header = true } = props;
  const rightLinks = <List direction="horizontal" align="right" items={links} />;
  const classes = useStyles();
  const brandComponent = (
    <Link to="/">
      <Avatar src={assetUrl("luca-avatar.jpg")} alt="Luca" className={classes.avatarLarge} />
    </Link>
  );
  const headerComponent = header ? (
    <Header
      brandComponent={brandComponent}
      rightLinks={rightLinks}
      paddingTop={1}
      paddingBottom={1}
    />
  ) : null;

  return (
    <>
      {headerComponent}
      <Container maxWidth="lg">{children}</Container>
    </>
  );
};

export default Main;
