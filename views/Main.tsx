import Avatar from "@material-ui/core/Avatar";
import { assetUrl } from "@metablock/core";
import { Header, Link } from "@metablock/react";
import React from "react";
import useStyles from "../context/styles";
import { List } from "../react";

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
  const rightLinks = <List direction="horizontal" align="right" items={links} />;
  const classes = useStyles();
  const brandComponent = (
    <Link to="/">
      <Avatar src={assetUrl("luca-avatar.jpg")} alt="Luca" className={classes.avatarLarge} />
    </Link>
  );

  return (
    <>
      <Header
        brandComponent={brandComponent}
        rightLinks={rightLinks}
        paddingTop={1}
        paddingBottom={1}
      />
      {children}
    </>
  );
};

export default Main;
