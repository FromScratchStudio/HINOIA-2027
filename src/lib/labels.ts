import type { Entry, ProjectFormat } from "@/types";

export const KIND_LABEL: Record<Entry["kind"], string> = {
  image: "Image",
  text: "Texte",
  html: "Page",
  pdf: "Document PDF",
  chapter: "Chapitre",
  link: "Ressource externe",
  audio: "Audio",
  playlist: "Playlist",
  video: "Vidéo",
};

/** Libellés courts, pour les badges de cartes. */
export const KIND_BADGE: Record<Entry["kind"], string> = {
  image: "Image",
  text: "Texte",
  html: "Page",
  pdf: "PDF",
  chapter: "Chapitre",
  link: "Ressource",
  audio: "Audio",
  playlist: "Playlist",
  video: "Vidéo",
};

export const FORMAT_LABEL: Record<ProjectFormat, string> = {
  series: "Série",
  oneshot: "One-shot",
  video: "Vidéo",
  mixed: "Projet",
};
