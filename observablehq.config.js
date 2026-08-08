import config from "@ls/config.js";
import ContentLoader from "@ls/content.js";
import footer from "@ls/footer.js";

const blog = await ContentLoader.load(config, "blog");
const coding = await ContentLoader.load(config, "coding");
const lab = await ContentLoader.load(config, "lab");

if (process.argv.includes("preview")) {
  blog.watch();
  coding.watch();
  lab.watch();
}

// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Luca Sbardella",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    { name: "now", path: "/now" },
    { name: "cv", path: "/cv" },
    { name: "contact", path: "/contact" },
    {
      name: "market",
      path: "/market",
      open: true,
      pages: [
        { name: "heatmap", path: "/market/heatmap" },
        { name: "fed", path: "/market/fed" },
        { name: "boe", path: "/market/boe" },
      ],
    },
    { name: "coding", path: "/coding", open: false, pages: coding.sidebar() },
    { name: "blog", path: "/blog", open: false, pages: blog.sidebar() },
    { name: "lab", path: "/lab", open: false, pages: lab.sidebar() },
    { name: "links", path: "/links" },
    { name: "analytics", path: "/analytics" },
    { name: "credits", path: "/credits" },
  ],

  dynamicPaths: [...blog.paths(), ...lab.paths(), ...coding.paths()],

  // Content to add to the head of the page, e.g. for a favicon:
  head: `
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
    tailwind.config = {
      corePlugins: {
        preflight: false
      }
    };
    </script>
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/luca-16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/luca-32.png">
    <link rel="icon" type="image/png" sizes="48x48" href="/assets/luca-48.png">
    <link rel="icon" type="image/png" sizes="64x64" href="/assets/luca-64.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/assets/luca-192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/assets/luca-512.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/luca-180.png">
    <link rel="manifest" href="/assets/manifest.json">
    <meta name="theme-color" content="#0C1018">
    <meta property="og:image" content="https://lucasbardella.com/assets/og-image.png">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://lucasbardella.com/assets/og-image.png">
    <meta name="google-adsense-account" content="ca-pub-9518486636408101">
  `,

  // The path to the source root.
  root: "content",

  style: "themes/dark.css",
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
