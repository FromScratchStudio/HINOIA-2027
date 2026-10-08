"use client";

import { useEffect } from "react";
import { useViewerStore } from "@/store/viewer";

interface MarkEntryVisitedProps {
  collectionSlug: string;
  projectSlug: string;
  entrySlug: string;
}

export function MarkEntryVisited({
  collectionSlug,
  projectSlug,
  entrySlug,
}: MarkEntryVisitedProps) {
  const markEntryVisited = useViewerStore((s) => s.markEntryVisited);

  useEffect(() => {
    markEntryVisited(collectionSlug, projectSlug, entrySlug);
  }, [collectionSlug, projectSlug, entrySlug, markEntryVisited]);

  return null;
}
