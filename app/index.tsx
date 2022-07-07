import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import React from "react";
import { hydrate } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import Main from "./main";
import { defaultTheme } from "./theme";

const root = document.getElementById("__metablock");

hydrate(
  <BrowserRouter>
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Main />
    </ThemeProvider>
  </BrowserRouter>,
  root
);
