import loadable from "@loadable/component";
import React from "react";

const CmsEntry = loadable(() => import(/* webpackChunkName: "CmsEntry" */ "./CmsEntry"));

const LoadableCmsEntry = (props: any) => {
  return <CmsEntry {...props} />;
};

export default LoadableCmsEntry;
