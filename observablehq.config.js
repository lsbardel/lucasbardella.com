import footer from "./src/footer.js";
import ContentLoader from "./src/content";
import pkg from "./package.json" with { type: "json" };


const config = {
  ...pkg,
  gtag: "G-PXRMNC0X0N",
};
const blog = await ContentLoader.load(config, "blog");
const coding = await ContentLoader.load(config, "coding");
const lab = await ContentLoader.load(config, "lab");

// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Luca Sbardella",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {name: "cv", path: "/cv"},
    {name: "contact", path: "/contact"},
    {name: "market", path: "/market", open: true, pages: [
      {name: "heatmap", path: "/market/heatmap"},
    ]},
    {name: "coding", path: "/coding",  open: false, pages: coding.sidebar()},
    {name: "blog", path: "/blog", open: false, pages: blog.sidebar()},
    {name: "lab", path: "/lab", open: false, pages: lab.sidebar()},
  ],

  dynamicPaths: blog.paths(),

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="data/luca-32x32.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "content",

  theme: ["glacier", "near-midnight"],
  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  footer: footer(config),

  // Some additional configuration options and their defaults:
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  output: "dist", // path to the output root for build
  search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
