import fs from "fs/promises";
import { basename, join } from "path";
import compileOptions from "./options";

const postsDirectory = join(process.cwd(), "content");

class ContentLoader {

  constructor(config, content, pages) {
    this.config = config;
    this.content = content;
    this.pages = pages;
  }

  static async loadPage(content, slug) {
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
    return this.pages.map((p) => p);
  }

  paths() {
    return this.pages.map((p) => p.path);
  }
}


const compileContent = async (sourcePath, content) => {
  const fileName = basename(sourcePath);
  if (!fileName.endsWith(".md")) return;
  let body = await fs.readFile(sourcePath, { encoding: "utf-8" });
  const bits = body.split("---\n");
  let date = new Date();
  if (bits.length > 2) {
    body = bits.slice(2).join("---\n")
    const options = compileOptions(bits[1]);
    if (options.date) {
      date = new Date(options.date);
      delete options.date;
    }
    let headers = Object.keys(options).map((o) => `${o}: ${options[o]}`);
    if (headers.length > 0) {
      body = `---\n${headers.join("\n")}---\n${body}`;
    }
  }
  const name = fileName.split(".")[0];
  const slug = name;
  const year = date.getFullYear();
  return {
    name,
    slug,
    content,
    path: `/${content}/${year}/${slug}`,
    year,
    body,
    date,
  };
}

export default ContentLoader;
