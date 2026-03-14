import { timeFormat } from "d3-time-format";
import { watch } from "fs";
import fs from "fs/promises";
import { basename, join } from "path";
import compileOptions from "./options";

const postsDirectory = join(process.cwd(), "content");
const formatDate = timeFormat("%B %d, %Y");

type Page = {
  name: string;
  slug: string;
  content: string;
  path: string;
  date: Date;
  description: string;
  body: string;
  year: number;
  private: boolean;
  options: Record<string, any>;
};


class ContentLoader {
  config: Record<string, any>;
  content: string;
  pages: Page[];

  constructor(config: Record<string, any>, content: string, pages: Page[]) {
    this.config = config;
    this.content = content;
    this.pages = pages.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  static async loadPage(content: string, slug: string): Promise<Page | undefined> {
    const sourcePath = join(postsDirectory, content, `${slug}.md`);
    return await compileContent(sourcePath, content);
  }

  static async load(config, content) {
    const sourceDir = join(postsDirectory, content);
    const files = await fs.readdir(sourceDir);
    const data = [];
    for (let i = 0; i < files.length; ++i) {
      const name = files[i];
      const sourcePath = join(sourceDir, name);
      const entry = await compileContent(sourcePath, content);
      if (entry) data.push(entry);
    }
    return new ContentLoader(config, content, data);
  }

  sidebar() {
    return this.pages.filter((p) => p.private === false).map((p) => {
      return { name: `${p.year} - ${p.name}`, path: p.path };
    });
  }

  paths() {
    return this.pages.map((p) => p.path);
  }

  watch() {
    const sourceDir = join(postsDirectory, this.content);
    const loaderPath = join(postsDirectory, this.content, "[year]", "[slug].md.ts");
    watch(sourceDir, async (_, filename) => {
      if (!filename?.endsWith(".md")) return;
      const now = new Date();
      try {
        await fs.utimes(loaderPath, now, now);
      } catch {
        // loader file may not exist
      }
    });
  }

  emitList(title: string) {
    process.stdout.write(`# ${title}\n`);
    this.pages.forEach((p) => {
      const date = formatDate(p.date);
      const description = p.description || "";
      if (p.private) return;
      const card = `<a class="no-deco" href="${p.path}">
        <div class="card">
          <h2 class="blog-list">${p.name}</h2>
          <h3 class="date">${date}</h3>
          <p class="description">${description}</p>
        </div>
      </a>`;
      process.stdout.write(card);
    });
  }
}


const heroFields = new Set(["heroImage", "heroOpacity", "heroBlur", "heroTextColor"]);

const textHeader = (entry: Page): string => {
  const title = entry.options.title || entry.name;
  const date = formatDate(entry.date);
  const description = entry.description || "";
  return [`# ${title}`, `<p class="date">${date}</p>`, `<p class="description">${description}</p>`].join("\n");
};

const heroHeader = (entry: Page): string => {
  const title = entry.options.title || entry.name;
  const description = entry.description || "";
  const heroImage = entry.options.heroImage;
  const opacityProp = entry.options.heroOpacity !== undefined ? ` opacity={${entry.options.heroOpacity}}` : "";
  const blurProp = entry.options.heroBlur ? ` blur="${entry.options.heroBlur}"` : "";
  const subtitleProp = description ? ` subtitle={${JSON.stringify(description)}}` : "";
  const dateProp = entry.date ? ` date={${JSON.stringify(formatDate(entry.date))}}` : "";
  const textColorProp = entry.options.heroTextColor ? ` textColor={${JSON.stringify(entry.options.heroTextColor)}}` : "";
  const ratio = entry.options.heroAspectRatio || "35%";
  return [
    `<div class="outer-placeholder" style="padding-top: ${ratio};">`,
    `<div class="inner-placeholder">`,
    "",
    "```tsx",
    `import {FileAttachment} from "observablehq:stdlib";`,
    `import {PageHeader} from "../../components/image.js";`,
    `const __images = FileAttachment("../../data/images.json").json();`,
    "```",
    "",
    "```tsx",
    `display(<PageHeader title={${JSON.stringify(title)}}${subtitleProp}${dateProp} urls={__images.${heroImage}}${opacityProp}${blurProp}${textColorProp} />);`,
    "```",
    "</div>",
    "</div>",
    `<h1 class="sr-only">${title}</h1>`, // for accessibility and SEO since the title is visually hidden in the hero
  ].join("\n");
};

export const emitContent = async (content: string, slug: string | undefined) => {
  if (!slug) return;
  const entry = await ContentLoader.loadPage(content, slug);
  if (entry) {
    const headers = Object.keys(entry.options).filter((o) => !heroFields.has(o)).map((o) => `${o}: ${entry.options[o]}`);
    const titleBlock = entry.options.heroImage ? heroHeader(entry) : textHeader(entry);
    let body = [titleBlock, entry.body].join("\n");
    if (headers.length > 0) {
      body = `---\n${headers.join("\n")}\n---\n${body}`;
    }
    process.stdout.write(body);
  }
}





const compileContent = async (sourcePath, content): Promise<Page | undefined> => {
  const fileName = basename(sourcePath);
  if (!fileName.endsWith(".md")) return;
  let body = await fs.readFile(sourcePath, { encoding: "utf-8" });
  const bits = body.split("---\n");
  let date = new Date();
  let description = "";
  let options: Record<string, any> = {};
  let private_ = false;
  if (bits.length > 2) {
    body = bits.slice(2).join("---\n")
    options = compileOptions(bits[1]);
    if (options.date) {
      date = new Date(options.date);
      delete options.date;
    }
    description = options.description || "";
    delete options.description;
    private_ = options.private === true ? true : false;
    delete options.sidebar;
  }
  const slug = fileName.split(".")[0];
  const name = options.title || slug;
  const year = date.getFullYear();
  return {
    name,
    slug,
    content,
    description,
    path: `/${content}/${year}/${slug}`,
    year,
    body,
    date,
    private: private_,
    options,
  } as Page;
}

export default ContentLoader;
