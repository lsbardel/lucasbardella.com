import { NotFound } from "@metablock/react";
import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "../pages/Home";
import Footer from "./Footer";

const Routes = () => {
  return (
    <>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
};

export default Routes;
