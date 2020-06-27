import { NotFound } from "@metablock/react";
import React from "react";
import { Route, Switch } from "react-router-dom";
import CmsPaginate from "./CmsPaginate";
import LoadableCmsEntry from "./LoadableCmsEntry";

interface CmsProps {
  match: any;
  topic?: string;
  slug?: string[];
  NotFoundComponent?: any;
  ListComponent?: any;
  EntryComponent?: any;
}

const CmsRoute = (props: CmsProps) => {
  const {
    match,
    slug = ["slug"],
    NotFoundComponent = NotFound,
    ListComponent,
    EntryComponent,
  } = props;
  let { topic = "" } = props;
  if (!topic) topic = match.url.substring(1);
  const entryPath = slug.map((s: string) => `:${s}`).join("/");
  let path = match.url;
  if (path.substring(path.length - 1) === "/") path = path.substring(0, path.length - 1);
  return (
    <Switch>
      {ListComponent === false ? (
        <Route
          exact
          path={match.url}
          render={(p) => (
            <LoadableCmsEntry
              params={{ slug: "index" }}
              topic={topic}
              slug={slug}
              Component={EntryComponent}
              NotFoundComponent={NotFoundComponent}
            />
          )}
        />
      ) : (
        <Route
          exact
          path={path}
          render={() => (
            <CmsPaginate path={match.url} topic={topic} slug={slug} Component={ListComponent} />
          )}
        />
      )}
      <Route
        exact
        path={`${path}/${entryPath}`}
        render={(p) => (
          <LoadableCmsEntry
            params={p.match.params}
            topic={topic}
            slug={slug}
            Component={EntryComponent}
            NotFoundComponent={NotFoundComponent}
          />
        )}
      />
      <Route component={NotFoundComponent} />
    </Switch>
  );
};

export default CmsRoute;
