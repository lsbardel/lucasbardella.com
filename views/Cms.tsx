import loadable from "@loadable/component";
import React from "react";
import Main from "./Main";

const CmsLazy = loadable(() => import(/* webpackChunkName: "cms" */ "../react/Cms"));

const Cms = (props: any) => {
  const { topic, match } = props;
  const extra: any = { target: `${topic}/${match.params.slug}.json` };
  return (
    <Main>
      <CmsLazy {...extra} />
    </Main>
  );
};

export default Cms;
