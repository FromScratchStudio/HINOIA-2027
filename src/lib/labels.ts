import type { Entry, ProjectFormat } from "@/types";

export const KIND_LABEL: Record<Entry["kind"], string> = {
  html: "Page",
  pdf: "Document PDF",
  chapter: "Chapitre",
  link: "Ressource externe",
  video: "Vidéo",
};

/** Libellés courts, pour les badges de cartes. */
export const KIND_BADGE: Record<Entry["kind"], string> = {
  html: "Page",
  pdf: "PDF",
  chapter: "Chapitre",
  link: "Ressource",
  video: "Vidéo",
};

export const FORMAT_LABEL: Record<ProjectFormat, string> = {
  series: "Série",
  oneshot: "One-shot",
  video: "Vidéo",
  mixed: "Projet",
};
