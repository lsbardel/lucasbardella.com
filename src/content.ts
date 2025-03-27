import { timeFormat } from "d3-time-format";
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
}


export const emitContent = async (content: string, slug: string | undefined) => {
  if (!slug) return;
  const entry = await ContentLoader.loadPage(content, slug);
  if (entry) {
    const headers = Object.keys(entry.options).map((o) => `${o}: ${entry.options[o]}`);
    const title = entry.options.title || entry.name;
    const date = formatDate(entry.date);
    const description = entry.description || "";
    let body = [`# ${title}`, `<p class="date">${date}</p>`,  `<p class="description">${description}</p>`, entry.body].join("\n");
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
