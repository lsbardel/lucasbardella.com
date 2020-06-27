import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
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
          <Box pb={6}>
            <Link to={entry.urlPath} color="inherit" underline="none">
              <Grid container spacing={3}>
                <Grid item>
                  <img alt={entry.title} src={entry.image} width="200" />
                </Grid>
                <Grid item xs={12} sm container>
                  <ListItemText
                    primary={
                      <Typography component="h2" variant="h5">
                        {entry.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="p" variant="subtitle1">
                          {entry.description}
                        </Typography>
                        <Typography component="p" variant="subtitle2">
                          by {entry.author} - {format(entry.date)}
                        </Typography>
                      </>
                    }
                  />
                </Grid>
              </Grid>
            </Link>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default ListLayout;
