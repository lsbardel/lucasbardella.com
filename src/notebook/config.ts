const config: Record<string, any> = {
  MARKED: "marked@v4.2.12",
  MERMAID: "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs",
  PURIFY: "dompurify@2.0.12/dist/purify.min.js",
  HL_ROOT: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0",
  HL_CSS: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles",
  KATEX: "https://cdn.jsdelivr.net/npm/katex@0.16.0",
  CODEMIRROR: "https://esm.sh/codemirror@6.0.1",
  OKTOKIT: "https://esm.sh/octokit@2.0.19",
  defaultHighlightStyle: {
    light: "github",
    dark: "base16/classic-dark",
  },
};

export default config;
