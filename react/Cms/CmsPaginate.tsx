import { bundleUrl } from "@metablock/core";
import "highlight.js/styles/github.css";
import React from "react";
import { useFetch } from "..";
import { CmsListData } from "./interfaces";
import ListLayout from "./ListLayout";
import { urlPath } from "./slug";
import store from "./store";

interface CmsPaginateProps {
  path: string;
  topic: string;
  slug: string[];
  Component?: any;
}

const CmsPaginate = (props: CmsPaginateProps) => {
  const { path, topic, slug, Component = ListLayout } = props;
  const url = bundleUrl(`${topic}/index.json`);
  const data = useFetch(() => store.get(url), url) || [];
  const entries = data.map((entry: CmsListData) => {
    entry.urlPath = `${path}/${urlPath(entry, slug)}`;
    return entry;
  });
  entries.sort((a: CmsListData, b: CmsListData) => (a.date > b.date ? -1 : 1));
  return <Component data={entries} slug={slug} />;
};

export default CmsPaginate;
