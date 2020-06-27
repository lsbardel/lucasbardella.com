import { blueGrey as primary, grey } from "@material-ui/core/colors";
import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";

export const options = {
  drawerWidth: 240,
};

export const lightTheme = responsiveFontSizes(
  createMuiTheme({
    typography: {
      fontSize: 18,
    },
    palette: {
      type: "light",
      background: {
        default: grey["100"],
      },
      primary: {
        light: primary["700"],
        main: primary["800"],
        dark: primary["900"],
      },
      secondary: {
        light: grey["50"],
        main: grey["100"],
        dark: grey["200"],
      },
    },
  })
);

export const darkTheme = responsiveFontSizes(
  createMuiTheme({
    typography: {
      fontSize: 18,
    },
    palette: {
      type: "dark",
      secondary: {
        light: grey["700"],
        main: grey["800"],
        dark: grey["900"],
      },
    },
  })
);
