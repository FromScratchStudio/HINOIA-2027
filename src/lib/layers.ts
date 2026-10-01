/**
 * Le site est une seule page à couches : l'URL dit jusqu'où la pile descend.
 *   /                                   accueil (logo) au-dessus des collections
 *   /collections                        collections
 *   /collections/:c                     projets d'une collection
 *   /collections/:c/:p                  contenus d'un projet
 *   /collections/:c/:p/:e               un contenu
 */
export type LayerPath =
  | { level: "welcome" }
  | { level: "collections" }
  | { level: "collection"; collection: string }
  | { level: "project"; collection: string; project: string }
  | { level: "entry"; collection: string; project: string; entry: string }
  | { level: "unknown" };

export function parseLayerPath(pathname: string | null): LayerPath {
  const segments = (pathname ?? "/").split("/").filter(Boolean).map(safeDecode);
  if (segments.length === 0) return { level: "welcome" };
  if (segments[0] !== "collections" || segments.length > 4) return { level: "unknown" };

  const [, collection, project, entry] = segments;
  if (entry) return { level: "entry", collection, project, entry };
  if (project) return { level: "project", collection, project };
  if (collection) return { level: "collection", collection };
  return { level: "collections" };
}

export function layerHref(collection?: string, project?: string, entry?: string) {
  return ["/collections", collection, project, entry].filter(Boolean).join("/");
}

function safeDecode(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
