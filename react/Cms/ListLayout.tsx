import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import { Link } from "@metablock/react";
import { timeFormat } from "d3-time-format";
import React from "react";
import { CmsListProps } from "./interfaces";

const ListLayout = (props: CmsListProps) => {
  const { data } = props;
  const format = timeFormat("%B %d, %Y");
  return (
    <List>
      {data.map((entry, index) => (
        <ListItem key={index}>
          <Link to={entry.urlPath} color="inherit" underline="none">
            <ListItemText
              primary={
                <Typography component="h2" variant="h4">
                  {entry.title}
                </Typography>
              }
              secondary={
                <>
                  <Typography component="p" variant="h6">
                    {entry.description}
                  </Typography>
                  <Typography component="p" variant="subtitle1">
                    by {entry.author} - {format(entry.date)}
                  </Typography>
                </>
              }
            />
          </Link>
        </ListItem>
      ))}
    </List>
  );
};

export default ListLayout;
