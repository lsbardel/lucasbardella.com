import fs from "fs/promises";
import { join, basename } from "path";


const postsDirectory = join(process.cwd(), "content");
const postCache = new Map<string, Entry[]>();

export type Entry = {
  slug: string,
  title: string;
  description: string;
  body: string,
  content: string;
  ogImage: {
    url: string;
  };
}

export const getPosts = async (content: string): Promise<Entry[]> => {
  if (postCache.has(content)) {
    return postCache.get(content) as Entry[];
  }
  const sourceDir = join(postsDirectory, content);
  const files = await fs.readdir(sourceDir);
  const data = [];
  for (let i = 0; i < files.length; ++i) {
    const name = files[i];
    const sourcePath = join(sourceDir, name);
    const entry = await compileContent(content, sourcePath);
    if (entry) data.push(entry);
  }
  postCache.set(content, data);
  return data;
}

export const getPostBySlug = async (content: string, slug: string): Promise<Entry | undefined> => {
  const posts = await getPosts(content);
  return posts.find((post) => post.slug === slug || (post.slug === "index" && slug === ""));
}


const compileContent = async (content: string, sourcePath: string): Promise<Entry | undefined> => {
  const fileName = basename(sourcePath);
  if (!fileName.endsWith(".md")) return;
  const text = await fs.readFile(sourcePath, { encoding: "utf-8" });
  const bits = text.split("---");
  const entry = compileOptions(bits[0]);
  entry.slug = fileName.split(".")[0];
  if (!entry.title) entry.title = entry.slug;
  if (!entry.description) entry.description = entry.title;
  if (!entry.ogImage) entry.ogImage = { url: "" };
  entry.content = content;
  entry.body = bits.slice(1).join("---").trim();
  return entry as Entry;
}


const compileOptions = (text: string): Record<string, any> => {
  return text
    .split("\n")
    .filter((text) => text.length > 0)
    .reduce((headers: Record<string, any>, header: string) => {
      const [key, value] = compileOption(header);
      if (key in headers) {
        if (headers[key].constructor !== Array) headers[key] = [headers[key]];
        headers[key].push(value);
      } else headers[key] = value;
      return headers;
    }, {});
};

const compileOption = (text: string): string[] => {
  const bits = text.split(":");
  const name = bits[0].trim();
  if (!name || bits.length < 2) throw new Error(`Bad header ${text}`);
  let value = bits.slice(1).join(":").trim();
  try {
    value = JSON.parse(value);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // skip on error
  }
  return [name, value];
};
