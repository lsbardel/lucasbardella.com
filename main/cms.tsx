// import remark from "remark"
import loadable from "@loadable/component";
import React from "react";

interface CmsPageProps {
  page: string;
}

const AsyncPage = loadable((props: CmsPageProps) => import(`./contents/blog/${props.page}.md`));

const Cms = () => {
  return <AsyncPage page="skills-of-a-data-miner" />;
};

export default Cms;
