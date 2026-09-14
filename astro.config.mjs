import { config as loadEnv } from "dotenv";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import react from "@astrojs/react";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkTexBlocks from "./src/plugins/remark-tex-blocks.mjs";

// The Google Analytics id lives in the repository root .env, where
// lsts/config.ts already reads it from, so the port does not duplicate it.
loadEnv({ path: "../.env", quiet: true });

export default defineConfig({
  // Absolute URLs for canonical links, og:url and the sitemap.
  site: "https://lucasbardella.com",
  integrations: [mdx(), react()],
  vite: { plugins: [tailwind()] },
  markdown: {
    // MDX inherits this processor, so .mdx files get the same plugins.
    processor: unified({
      // Observable leaves `typographer` off, so straight quotes stay straight.
      // With it on, smart quotes also corrupt attribute quotes in raw HTML.
      smartypants: false,
      // remarkTexBlocks runs first so ```tex fences become math nodes,
      // which remark-math/rehype-katex then render like any $$ block.
      remarkPlugins: [remarkTexBlocks, remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
