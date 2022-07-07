import { Copyright, List } from "@metablock/react";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import TwitterIcon from "@mui/icons-material/Twitter";
import KeybaseIcon from "@mui/icons-material/VpnKey";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import React from "react";
import Container from "./Container";

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
    href: "https://keybase.io/lsbardel",
    icon: <KeybaseIcon />,
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
    text: "cv",
    to: "/cv",
  },
  {
    text: "lab",
    to: "/lab",
  },
  {
    text: "blog",
    to: "/blog",
  },
  {
    text: "contact",
    to: "/contact",
  },
  {
    text: "colophon",
    to: "/colophon",
  },
];

const Footer: React.FC = () => {
  return (
    <Box fontSize={8}>
      <Typography component="footer" variant="body2" color="textSecondary">
        <Container>
          <Box pt={3} pb={1}>
            <Grid container spacing={4}>
              <Grid item md={12} lg={6}>
                {social.map((s: any, index: number) => (
                  <IconButton key={index} color="primary" component="span">
                    <MuiLink target="_blank" rel="noopener" href={s.href}>
                      {s.icon}
                    </MuiLink>
                  </IconButton>
                ))}
              </Grid>
              <Grid item md={12} lg={6}>
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
        </Container>
      </Typography>
    </Box>
  );
};

export default Footer;
