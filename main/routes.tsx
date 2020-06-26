import { NotFound } from "@metablock/react";
import React from "react";
import { Route, Switch } from "react-router-dom";
import Cv from "../pages/Cv";
import Home from "../pages/Home";
import Cms from "../react/Cms";
import Footer from "../views/Footer";
import Main from "../views/Main";

const Routes = () => {
  return (
    <>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/cv" component={Cv} />
        <Route
          exact
          path="/blog/:slug"
          render={(p: any) => (
            <Main>
              <Cms target={`blog/${p.match.params.slug}.json`} />
            </Main>
          )}
        />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
};

export default Routes;
