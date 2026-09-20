export type AssetType = "image" | "gif" | "video";

export interface ShowcaseItem {
  id: string;
  type: AssetType;
  src: string;
  alt: string;
  poster?: string; // for video
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  pages: string[]; // image URLs
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  overview: string;
  drafts: string[]; // image URLs
  chapters: Chapter[];
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  projects: Project[];
}

export interface SiteData {
  showcase: ShowcaseItem[];
  collections: Collection[];
}
