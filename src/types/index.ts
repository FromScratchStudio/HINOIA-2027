export type AssetType = "image" | "gif" | "video";

export interface ShowcaseItem {
  id: string;
  type: AssetType;
  src: string;
  alt: string;
  poster?: string; // for video
}

/** Les formes que peut prendre une feuille de fin de parcours. */
export type EntryKind = "image" | "text" | "video" | "audio" | "playlist" | "html" | "pdf" | "chapter" | "link";

interface EntryBase {
  id: string;
  slug: string;
  title: string;
  description?: string;
  /** Image révélée au survol de la tuile ; à défaut, celle du projet. */
  thumbnail?: string;
}

export interface ImageEntry extends EntryBase {
  kind: "image";
  src: string;
  alt?: string;
  caption?: string;
}

export interface TextEntry extends EntryBase {
  kind: "text";
  text: string;
  source?: "asset" | "reference";
  href?: string;
}

/** Page rédigée. Le HTML vient du dépôt (data/site.json), donc de source sûre. */
export type HtmlEntry = EntryBase & (
  | {
      kind: "html";
      source: "inline";
      html: string;
      src?: string;
      url?: string;
    }
  | {
      kind: "html";
      source: "asset";
      src: string;
      html?: string;
      url?: string;
    }
  | {
      kind: "html";
      source: "reference";
      url: string;
      html?: string;
      src?: string;
    }
);

export type AudioEntry = EntryBase & (
  | {
      kind: "audio";
      source: "file";
      src: string;
      tracks?: { title?: string; src: string }[];
      poster?: string;
    }
  | {
      kind: "audio";
      source: "playlist";
      src?: string;
      tracks: { title?: string; src: string }[];
      poster?: string;
    }
);

export interface PlaylistEntry extends EntryBase {
  kind: "playlist";
  tracks: { title?: string; src: string }[];
  poster?: string;
}

export interface PdfEntry extends EntryBase {
  kind: "pdf";
  file: string;
  pageCount?: number;
  embed?: boolean;
}

/** Chapitre illustré : une suite de planches lues verticalement. */
export interface ChapterEntry extends EntryBase {
  kind: "chapter";
  pages: string[];
}

export interface LinkEntry extends EntryBase {
  kind: "link";
  url: string;
  label?: string;
}

/** Vidéo : un fichier lu nativement, ou un lecteur externe intégré (YouTube, Vimeo…). */
export interface VideoEntry extends EntryBase {
  kind: "video";
  src?: string;
  poster?: string;
  embed?: string;
}

export type Entry = ImageEntry | TextEntry | HtmlEntry | AudioEntry | PlaylistEntry | PdfEntry | ChapterEntry | LinkEntry | VideoEntry;

/** Nature d'un projet : décide de la façon dont ses contenus sont présentés. */
export type ProjectFormat = "series" | "oneshot" | "video" | "mixed";

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  overview: string;
  format?: ProjectFormat;
  /** Troisième niveau de grille ; chaque élément est une feuille lisible. */
  entries: Entry[];
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
