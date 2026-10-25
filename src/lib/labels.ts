import type { Entry, ProjectFormat } from "@/types";

export const KIND_LABEL: Record<Entry["kind"], string> = {
  html: "Page",
  text: "Texte",
  image: "Image",
  audio: "Playlist audio",
  pdf: "Document PDF",
  chapter: "Chapitre",
  link: "Ressource externe",
  video: "Vidéo",
};

/** Libellés courts, pour les badges de cartes. */
export const KIND_BADGE: Record<Entry["kind"], string> = {
  html: "Page",
  text: "Texte",
  image: "Image",
  audio: "Audio",
  pdf: "PDF",
  chapter: "Chapitre",
  link: "Ressource",
  video: "Vidéo",
};

export const FORMAT_LABEL: Record<ProjectFormat, string> = {
  series: "Série",
  oneshot: "One-shot",
  wall: "Mur",
  video: "Vidéo",
  mixed: "Projet",
};

/**
 * Collections dont la vignette est un tampon noir sur transparent, au même
 * registre graphique que le logo HINOIA : on lui applique le même traitement
 * clair/sombre (--logo-filter) plutôt qu'un rendu couleur figé.
 */
const MONOCHROME_COLLECTIONS = new Set(["norush", "las-casas", "rushes"]);

export function isMonochromeCollection(slug: string): boolean {
  return MONOCHROME_COLLECTIONS.has(slug);
}
