export type AssetType = "image" | "gif" | "video";

export interface ShowcaseItem {
  id: string;
  type: AssetType;
  src: string;
  alt: string;
  poster?: string; // for video
}

/** Les formes que peut prendre une feuille de fin de parcours. */
export type EntryKind = "html" | "text" | "image" | "audio" | "pdf" | "chapter" | "link" | "video";

interface EntryBase {
  id: string;
  slug: string;
  title: string;
  description?: string;
  /** Image révélée au survol de la tuile ; à défaut, celle du projet. */
  thumbnail?: string;
}

/** Page rédigée. Le HTML vient du dépôt (data/site.json), donc de source sûre. */
export interface HtmlInlineEntry extends EntryBase {
  kind: "html";
  source: "inline";
  html: string;
}

/** Page HTML statique embarquée depuis les assets publics. */
export interface HtmlAssetEntry extends EntryBase {
  kind: "html";
  source: "asset";
  file: string;
}

/** Page HTML externe référencée pour aperçu intégré. */
export interface HtmlReferenceEntry extends EntryBase {
  kind: "html";
  source: "reference";
  url: string;
}

export type HtmlEntry = HtmlInlineEntry | HtmlAssetEntry | HtmlReferenceEntry;

export interface TextEntry extends EntryBase {
  kind: "text";
  text: string;
}

export interface ImageEntry extends EntryBase {
  kind: "image";
  images: { src: string; alt?: string }[];
}

export interface AudioEmbedEntry extends EntryBase {
  kind: "audio";
  source: "embed";
  embed: string;
}

export interface AudioTracksEntry extends EntryBase {
  kind: "audio";
  source: "tracks";
  tracks: { src: string; title?: string }[];
}

export type AudioEntry = AudioEmbedEntry | AudioTracksEntry;

export interface PdfEntry extends EntryBase {
  kind: "pdf";
  file: string;
  pageCount?: number;
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

export type Entry = HtmlEntry | TextEntry | ImageEntry | AudioEntry | PdfEntry | ChapterEntry | LinkEntry | VideoEntry;

/** Nature d'un projet : décide de la façon dont ses contenus sont présentés. */
export type ProjectFormat = "series" | "oneshot" | "wall" | "video" | "mixed";

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
