"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ViewerState {
  /** Slugs of collections the viewer has opened */
  visitedCollections: string[];
  /** Slugs of projects the viewer has opened (format: "collectionSlug/projectSlug") */
  visitedProjects: string[];
  /** Last visited collection slug */
  lastCollection: string | null;
  markCollectionVisited: (slug: string) => void;
  markProjectVisited: (collectionSlug: string, projectSlug: string) => void;
  setLastCollection: (slug: string) => void;
}

export const useViewerStore = create<ViewerState>()(
  persist(
    (set) => ({
      visitedCollections: [],
      visitedProjects: [],
      lastCollection: null,
      markCollectionVisited: (slug) =>
        set((state) => ({
          visitedCollections: state.visitedCollections.includes(slug)
            ? state.visitedCollections
            : [...state.visitedCollections, slug],
        })),
      markProjectVisited: (collectionSlug, projectSlug) => {
        const key = `${collectionSlug}/${projectSlug}`;
        set((state) => ({
          visitedProjects: state.visitedProjects.includes(key)
            ? state.visitedProjects
            : [...state.visitedProjects, key],
        }));
      },
      setLastCollection: (slug) => set({ lastCollection: slug }),
    }),
    {
      name: "hinoia-viewer-state",
    }
  )
);
