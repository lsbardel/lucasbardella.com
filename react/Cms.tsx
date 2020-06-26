import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { HttpClient } from "@metablock/core";
import { Parallax } from "@metablock/react";
import dompurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import marked from "marked";
import { action, observable } from "mobx";
import React from "react";
import { useFetch } from ".";

interface CmsProps {
  target: string;
  sanitize?: Record<string, any> | boolean;
  Component?: any;
}

export interface CmsData {
  title: string;
  description: string;
  author: string;
  date: string;
  body: string;
  htmlBody: string;
}

export class CmsStore {
  cli: HttpClient;

  @observable inProgress = false;
  @observable error?: any = undefined;
  @observable data: Record<string, any> = {};

  constructor() {
    this.cli = new HttpClient();
  }

  @action
  async get(path: string): Promise<any> {
    this.inProgress = true;
    this.error = undefined;
    try {
      if (!this.data[path]) {
        const response = await this.cli.get(path);
        this.data[path] = response.data;
      }
      return this.data[path];
    } catch (error) {
      this.error = error;
    } finally {
      this.inProgress = false;
    }
  }
}

const store = new CmsStore();

const Cms = (props: CmsProps) => {
  const { target, Component = SimpleEntry, sanitize = true } = props;
  const data = useFetch(() => store.get(`/static/${target}`));
  const doSanitize = sanitize === true ? {} : sanitize;
  if (!data) return null;
  const json = data as CmsData;
  marked.setOptions({
    highlight: (code) => {
      return hljs.highlightAuto(code).value;
    },
  });
  json.htmlBody = marked(json.body);
  if (doSanitize) json.htmlBody = dompurify.sanitize(json.htmlBody, doSanitize);
  return <Component {...json} />;
};

const SimpleEntry = (props: CmsData) => {
  return (
    <>
      <Parallax small>
        <Typography component="h1" variant="h3" align="center" paragraph>
          {props.title}
        </Typography>
        <Typography component="h5" variant="subtitle1" align="center" paragraph>
          by {props.author} on {props.date}
        </Typography>
        {props.description ? (
          <Typography component="div" variant="h6" align="center">
            {props.description}
          </Typography>
        ) : null}
      </Parallax>
      <Box pt={3} pb={4}>
        <Typography variant="body1">
          <div dangerouslySetInnerHTML={{ __html: props.htmlBody }}></div>
        </Typography>
      </Box>
    </>
  );
};
export default Cms;
