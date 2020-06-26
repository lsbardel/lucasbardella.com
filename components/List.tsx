import MuiLink from "@material-ui/core/Link";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { Link } from "@metablock/react";
import React from "react";

type Direction = "vertical" | "horizontal";
type Align = "left" | "right";

interface ListProps {
  items: any[];
  direction?: Direction;
  align?: Align;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    horizontalLeft: {
      display: "flex",
      flexDirection: "row",
      padding: 0,
    },
    horizontalRight: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-end",
      padding: 0,
    },
    horizontalLeftItem: {
      width: "auto",
      padding: 0,
      paddingRight: theme.spacing(2),
    },
    horizontalRightItem: {
      width: "auto",
      padding: 0,
      paddingLeft: theme.spacing(2),
    },
    vertical: {},
    verticalItem: {},
    icon: {
      minWidth: "auto",
      paddingRight: theme.spacing(0.5),
    },
  })
);

const List = (props: ListProps) => {
  const { items, direction = "vertical", align = "left" } = props;
  const name = `${direction}${align
    .substring(0, 1)
    .toUpperCase()}${align.substring(1)}`;
  const classes: Record<string, any> = useStyles();
  const classList = classes[name];
  const classItem = classes[`${name}Item`];
  return (
    <MuiList className={classList}>
      {items
        .filter((item) => item.text || item.href || item.to)
        .map((item, index) => (
          <ListItem key={index} className={classItem}>
            <ListItemIcon className={classes.icon}>{item.icon}</ListItemIcon>
            <ListItemText
              secondaryTypographyProps={{ component: "div" }}
              secondary={
                item.href ? (
                  <MuiLink href={item.href}>{item.text || item.href}</MuiLink>
                ) : item.to ? (
                  <Link to={item.to}>{item.text || item.to}</Link>
                ) : (
                  item.text
                )
              }
            />
          </ListItem>
        ))}
    </MuiList>
  );
};

export default List;
