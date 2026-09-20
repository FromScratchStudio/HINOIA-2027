"use client";

import { useEffect } from "react";
import { useViewerStore } from "@/store/viewer";

interface MarkCollectionVisitedProps {
  slug: string;
}

export function MarkCollectionVisited({ slug }: MarkCollectionVisitedProps) {
  const markCollectionVisited = useViewerStore((s) => s.markCollectionVisited);
  const setLastCollection = useViewerStore((s) => s.setLastCollection);

  useEffect(() => {
    markCollectionVisited(slug);
    setLastCollection(slug);
  }, [slug, markCollectionVisited, setLastCollection]);

  return null;
}
