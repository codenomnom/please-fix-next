export interface ContentFrontmatter {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  lang?: string;
  // add other common fields as needed (date, tags, etc.)
}

export type MarkdownModule = {
  frontmatter: ContentFrontmatter;
  default: any;
};
