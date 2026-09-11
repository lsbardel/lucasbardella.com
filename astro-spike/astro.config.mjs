import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkTexBlocks from "./src/plugins/remark-tex-blocks.mjs";

export default defineConfig({
  integrations: [mdx(), react()],
  vite: { plugins: [tailwind()] },
  markdown: {
    // remarkTexBlocks runs first so ```tex fences become math nodes,
    // which remark-math/rehype-katex then render like any $$ block.
    remarkPlugins: [remarkTexBlocks, remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
