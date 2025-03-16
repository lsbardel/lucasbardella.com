import { grey, blueGrey as primary } from "@mui/material/colors";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

export const options = {
  drawerWidth: 240,
};

export const fontFamilyMono = "'Roboto Mono', monospace";

export const lightTheme = responsiveFontSizes(
  createTheme({
    typography: {
      fontSize: 18,
      fontFamily: "'Roboto', sans-serif",
      caption: {
        fontSize: 12,
      },
    },
    palette: {
      mode: "light",
      background: {
        default: grey["100"],
      },
      primary: {
        light: primary["500"],
        main: primary["700"],
        dark: primary["800"],
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
  createTheme({
    typography: {
      fontSize: 18,
    },
    palette: {
      mode: "dark",
      secondary: {
        light: grey["700"],
        main: grey["800"],
        dark: grey["900"],
      },
    },
  })
);

export const getHighlightStyle = (mode: string) => {
  return mode === "light" ? "github" : "base16/classic-dark";
};

export const defaultTheme = darkTheme;
