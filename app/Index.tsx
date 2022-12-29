import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Main from "./Main";

const root = document.getElementById("__metablock") as HTMLElement;

hydrateRoot(
  root,
  <BrowserRouter>
    <Main />
  </BrowserRouter>
);
