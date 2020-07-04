import Box from "@material-ui/core/Box";
import { useTheme } from "@material-ui/core/styles";
import { CmsRoute } from "@metablock/cms";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { BlogList, LabList } from "../views/CmsList";
import CmsPageEntry from "../views/CmsPageEntry";
import Footer from "../views/Footer";
import Main from "../views/Main";

const Routes = () => {
  const theme = useTheme();
  return (
    <Main>
      <Box bgcolor={theme.palette.background.paper}>
        <Switch>
          <Route
            path="/blog"
            render={({ match }) => (
              <CmsRoute
                match={match}
                slug={["yyyy", "mm", "slug"]}
                ListComponent={BlogList}
                EntryComponent={CmsPageEntry}
              />
            )}
          />
          <Route
            path="/lab"
            render={({ match }) => (
              <CmsRoute
                match={match}
                ListComponent={LabList}
                EntryComponent={CmsPageEntry}
              />
            )}
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
      </Box>
      <Footer />
    </Main>
  );
};

export default Routes;
