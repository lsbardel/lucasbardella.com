import Avatar from "@material-ui/core/Avatar";
import { assetUrl, getBlock } from "@metablock/core";
import { Header, Link, List, useGa } from "@metablock/react";
import React from "react";
import useStyles from "../context/styles";
import maxWidth from "./width";

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
  const { children } = props;
  const block = getBlock();
  const rightLinks = (
    <List direction="horizontal" align="right" items={links} />
  );
  const classes = useStyles();
  const BrandComponent = () => (
    <Link to="/">
      <Avatar
        src={assetUrl("luca-avatar.jpg")}
        alt="Luca"
        className={classes.avatarLarge}
      />
    </Link>
  );
  useGa(block.plugins.ga?.id);

  return (
    <>
      <Header
        BrandComponent={BrandComponent}
        rightLinks={rightLinks}
        paddingTop={1}
        paddingBottom={1}
        maxWidth={maxWidth}
      />
      {children}
    </>
  );
};

export default Main;
