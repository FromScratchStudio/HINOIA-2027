"use client";

import { useEffect } from "react";
import { useViewerStore } from "@/store/viewer";

interface MarkProjectVisitedProps {
  collectionSlug: string;
  projectSlug: string;
}

export function MarkProjectVisited({
  collectionSlug,
  projectSlug,
}: MarkProjectVisitedProps) {
  const markProjectVisited = useViewerStore((s) => s.markProjectVisited);

  useEffect(() => {
    markProjectVisited(collectionSlug, projectSlug);
  }, [collectionSlug, projectSlug, markProjectVisited]);

  return null;
}
