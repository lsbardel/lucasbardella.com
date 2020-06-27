import dompurify from "dompurify";
import { bundleUrl } from "@metablock/core";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import marked from "marked";
import React from "react";
import { useFetch } from "..";
import SimpleEntry from "./EntryLayout";
import { CmsData } from "./interfaces";
import { matchSlug } from "./slug";
import store from "./store";

interface CmsProps {
  topic: string;
  slug: string[];
  NotFoundComponent: any;
  params: Record<string, any>;
  sanitize?: Record<string, any> | boolean;
  Component?: any;
}

const CmsEntry = (props: CmsProps) => {
  const {
    topic,
    params,
    slug,
    NotFoundComponent,
    Component = SimpleEntry,
    sanitize = true,
  } = props;
  const url = bundleUrl(`${topic}/${params.slug}.json`);
  const data = useFetch(() => store.get(url), url);
  const doSanitize = sanitize === true ? {} : sanitize;
  if (!data) return null;
  const entry = data as CmsData;
  if (!matchSlug(entry, slug, params)) return <NotFoundComponent />;
  marked.setOptions({
    highlight: (code) => {
      return hljs.highlightAuto(code).value;
    },
  });
  entry.htmlBody = marked(entry.body);
  if (doSanitize) entry.htmlBody = dompurify.sanitize(entry.htmlBody, doSanitize);
  return <Component {...entry} />;
};

export default CmsEntry;
