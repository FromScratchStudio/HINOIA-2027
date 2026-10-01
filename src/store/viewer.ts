import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ViewerState {
  /** Slugs of collections the viewer has opened */
  visitedCollections: string[];
  /** Slugs of projects the viewer has opened (format: "collectionSlug/projectSlug") */
  visitedProjects: string[];
  /** Leaves the viewer has opened (format: "collectionSlug/projectSlug/entrySlug") */
  visitedEntries: string[];
  /** Last visited collection slug */
  lastCollection: string | null;
  markCollectionVisited: (slug: string) => void;
  markProjectVisited: (collectionSlug: string, projectSlug: string) => void;
  markEntryVisited: (
    collectionSlug: string,
    projectSlug: string,
    entrySlug: string
  ) => void;
  setLastCollection: (slug: string) => void;
}

const append = (list: string[], key: string) =>
  list.includes(key) ? list : [...list, key];

export const useViewerStore = create<ViewerState>()(
  persist(
    (set) => ({
      visitedCollections: [],
      visitedProjects: [],
      visitedEntries: [],
      lastCollection: null,
      markCollectionVisited: (slug) =>
        set((state) => ({
          visitedCollections: append(state.visitedCollections, slug),
        })),
      markProjectVisited: (collectionSlug, projectSlug) =>
        set((state) => ({
          visitedProjects: append(
            state.visitedProjects,
            `${collectionSlug}/${projectSlug}`
          ),
        })),
      markEntryVisited: (collectionSlug, projectSlug, entrySlug) =>
        set((state) => ({
          visitedEntries: append(
            state.visitedEntries,
            `${collectionSlug}/${projectSlug}/${entrySlug}`
          ),
        })),
      setLastCollection: (slug) => set({ lastCollection: slug }),
    }),
    {
      name: "hinoia-viewer-state",
      // Le HTML statique est rendu sans historique : AppShell réhydrate après le montage,
      // pour que le premier rendu client corresponde au serveur.
      skipHydration: true,
    }
  )
);
