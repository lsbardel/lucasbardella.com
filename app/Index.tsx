import React from "react";
import { hydrate } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import Main from "./Main";

const root = document.getElementById("__metablock");

hydrate(
  <BrowserRouter>
    <Main />
  </BrowserRouter>,
  root
);
