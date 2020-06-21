import { blue, grey } from "@material-ui/core/colors";
import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";

export const options = {
  drawerWidth: 240,
};

export const lightTheme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      type: "light",
      primary: blue,
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
