import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import { Copyright, Link, Section } from "@metablock/react";
import React from "react";
import useStyles from "./styles";

const columns = [
  {
    name: "Company",
    links: [
      {
        label: "About",
        to: "/about",
      },
      {
        label: "Services",
        to: "/services",
      },
      {
        label: "Expertise",
        to: "/expertise",
      },
      {
        label: "Contact",
        to: "/contact",
      },
    ],
  },
  {
    name: "More",
    links: [
      {
        label: "Blog",
        to: "/blog",
      },
      {
        label: "Open Source Software",
        to: "/oss",
      },
    ],
  },
];

const Footer: React.FC = () => {
  const classes = useStyles();
  return (
    <Box fontSize={8}>
      <Typography component="footer" variant="body2" color="textSecondary" className={classes.root}>
        <Section component="div">
          <Grid container spacing={4}>
            {columns.map((column) => (
              <Grid item sm={6} md={3} key={column.name}>
                <Typography component="h5">{column.name}</Typography>
                <List>
                  {column.links.map((entry: any, index: number) => (
                    <ListItem className={classes.listItem} key={index}>
                      <Link color="inherit" to={entry.to}>
                        {entry.label}
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            ))}
          </Grid>
        </Section>
        <Section component="div">
          <Grid container>
            <Grid item sm={12}>
              <Copyright />
            </Grid>
          </Grid>
        </Section>
      </Typography>
    </Box>
  );
};

export default Footer;
