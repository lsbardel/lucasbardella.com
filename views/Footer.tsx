import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import MuiLink from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import DirectionsBikeIcon from "@material-ui/icons/DirectionsBike";
import GitHubIcon from "@material-ui/icons/GitHub";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import TwitterIcon from "@material-ui/icons/Twitter";
import { Copyright } from "@metablock/react";
import React from "react";
import { List } from "../components";
import useStyles from "../context/styles";
import Main from "./Main";

const social = [
  {
    href: "https://twitter.com/lsbardel",
    icon: <TwitterIcon />,
  },
  {
    href: "https://www.linkedin.com/in/lucasbardella",
    icon: <LinkedInIcon />,
  },
  {
    href: "https://github.com/quantmind",
    icon: <GitHubIcon />,
  },
  {
    href: "https://www.flickr.com/photos/sbardella/",
    icon: <PhotoCameraIcon />,
  },
  {
    href: "https://www.strava.com/athletes/lsbardel",
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
      <Typography component="footer" variant="body2" color="textSecondary" className={classes.root}>
        <Main header={false}>
          <Box pt={3} pb={1}>
            <Grid container spacing={4}>
              <Grid item sm={6}>
                {social.map((s: any, index: number) => (
                  <IconButton key={index} color="primary" component="span">
                    <MuiLink target="_blank" rel="noopener" href={s.href}>
                      {s.icon}
                    </MuiLink>
                  </IconButton>
                ))}
              </Grid>
              <Grid item sm={6}>
                <List direction="horizontal" align="right" items={links} />
              </Grid>
              <Grid item sm={12}>
                <Typography variant="body2" color="textSecondary" align="center">
                  <MuiLink color="inherit" href="https://github.com/lsbardel/lucasbardella.com">
                    Webside code on github
                  </MuiLink>
                </Typography>
                <Copyright
                  title="Luca Sbardella."
                  rights={
                    <MuiLink
                      target="_blank"
                      rel="noopener"
                      color="inherit"
                      href="https://creativecommons.org/licenses/by/4.0/"
                    >
                      Some rights reserved
                    </MuiLink>
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
