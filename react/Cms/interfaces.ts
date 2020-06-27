export interface CmsListData {
  title: string;
  description: string;
  author: string;
  date: Date | string;
  slug: string;
  urlPath: string;
}

export interface CmsData extends CmsListData {
  body: string;
  htmlBody: string;
}

export interface CmsListProps {
  data: CmsListData[];
}
