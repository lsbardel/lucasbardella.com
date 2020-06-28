import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import { hydrate } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { lightTheme } from "../context/theme";
import Routes from "./routes";

const root = document.getElementById("__metablock");

hydrate(
  <BrowserRouter>
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Routes />
    </ThemeProvider>
  </BrowserRouter>,
  root
);
