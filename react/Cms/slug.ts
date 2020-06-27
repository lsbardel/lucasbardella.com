import { CmsListData } from "./interfaces";

export const slugValues = (entry: CmsListData): Record<string, string> => {
  const date = typeof entry.date === "string" && entry.date ? new Date(entry.date) : entry.date;
  entry.date = date;
  return date
    ? {
        yyyy: "" + (date as Date).getFullYear(),
        mm: "" + (date as Date).getMonth(),
        slug: entry.slug,
      }
    : { slug: entry.slug };
};

export const urlPath = (entry: CmsListData, slug: string[]) => {
  const values = slugValues(entry);
  return slug.map((s: string) => values[s]).join("/");
};

export const matchSlug = (entry: CmsListData, slug: string[], params: Record<string, any>) => {
  const values = slugValues(entry);
  return slug.filter((s: string) => params[s] === values[s]).length === slug.length;
};
