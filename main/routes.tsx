import React from "react";
import { Route, Switch } from "react-router-dom";
import { CmsRoute } from "../react/Cms";
import { BlogList, LabList } from "../views/CmsList";
import CmsPageEntry from "../views/CmsPageEntry";
import Footer from "../views/Footer";
import Main from "../views/Main";

const Routes = () => {
  return (
    <Main header={true} component={false}>
      <Switch>
        <Route
          path="/blog"
          render={({ match }) => (
            <CmsRoute match={match} slug={["yyyy", "mm", "slug"]} ListComponent={BlogList} />
          )}
        />
        <Route
          path="/lab"
          render={({ match }) => <CmsRoute match={match} ListComponent={LabList} />}
        />
        <Route
          path="/"
          render={({ match }) => (
            <CmsRoute
              topic="pages"
              match={match}
              ListComponent={false}
              EntryComponent={CmsPageEntry}
            />
          )}
        />
      </Switch>
      <Footer />
    </Main>
  );
};

export default Routes;
