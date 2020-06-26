import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import DirectionsBikeIcon from "@material-ui/icons/DirectionsBike";
import GitHubIcon from "@material-ui/icons/GitHub";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import TwitterIcon from "@material-ui/icons/Twitter";
import { Link } from "@metablock/react";
import React from "react";
import Copyright from "../components/Copyright";
import List from "../components/List";
import Main from "../components/Main";
import useStyles from "./styles";

const social = [
  {
    url: "https://twitter.com/lsbardel",
    icon: <TwitterIcon />,
  },
  {
    url: "https://www.linkedin.com/in/lucasbardella",
    icon: <LinkedInIcon />,
  },
  {
    url: "https://github.com/quantmind",
    icon: <GitHubIcon />,
  },
  {
    url: "https://www.flickr.com/photos/sbardella/",
    icon: <PhotoCameraIcon />,
  },
  {
    url: "https://www.strava.com/athletes/lsbardel",
    icon: <DirectionsBikeIcon />,
  },
];

const links = [
  {
    text: "lab",
    to: "/lab",
  },
  {
    text: "blog",
    to: "/blog",
  },
  {
    text: "cv",
    to: "/cv",
  },
];

const Footer: React.FC = () => {
  const classes = useStyles();
  return (
    <Box fontSize={8}>
      <Typography
        component="footer"
        variant="body2"
        color="textSecondary"
        className={classes.root}
      >
        <Main>
          <Box pt={3} pb={1}>
            <Grid container spacing={4}>
              <Grid item sm={6}>
                {social.map((s: any, index: number) => (
                  <IconButton key={index} color="primary" component="span">
                    <Link target="_blank" rel="noopener" href={s.url}>
                      {s.icon}
                    </Link>
                  </IconButton>
                ))}
              </Grid>
              <Grid item sm={6}>
                <List direction="horizontal" align="right" items={links} />
              </Grid>
              <Grid item sm={12}>
                <Copyright
                  title="Luca Sbardella."
                  rights={
                    <Link
                      target="_blank"
                      rel="noopener"
                      href="https://creativecommons.org/licenses/by/4.0/"
                    >
                      Some rights reserved
                    </Link>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </Main>
      </Typography>
    </Box>
  );
};

export default Footer;
