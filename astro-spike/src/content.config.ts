import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

// No zod schema on purpose: the existing pages carry loose frontmatter such as
// `date: 2014 November 6`, and a spike should not force them to be cleaned up.
const blog = defineCollection({ loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }) });
const lab = defineCollection({ loader: glob({ base: "./src/content/lab", pattern: "**/*.{md,mdx}" }) });

export const collections = { blog, lab };
