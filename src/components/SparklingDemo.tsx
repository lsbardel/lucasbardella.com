import * as d3 from "d3";
import * as React from "react";
import { useRemote } from "./inputs";
import Sparkling from "./sparkling";

/** Replaces `FileAttachment("../../data/sparkling.csv").csv({typed: true})`. */
const SparklingDemo = () => {
  const data = useRemote("/assets/sparkling.csv", (text) =>
    d3.csvParse(text, d3.autoType) as unknown as React.ComponentProps<typeof Sparkling>["data"],
  );
  return data ? <Sparkling data={data} /> : <p>Loading the wines…</p>;
};

export default SparklingDemo;
