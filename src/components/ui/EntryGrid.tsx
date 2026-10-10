"use client";

import { GridCard } from "@/components/ui/GridCard";
import { useViewerStore } from "@/store/viewer";
import { KIND_BADGE } from "@/lib/labels";
import type { Entry } from "@/types";

interface EntryGridProps {
  collectionSlug: string;
  projectSlug: string;
  entries: Entry[];
  /** Image de repli : celle du projet parent. */
  projectThumbnail?: string;
}

export function EntryGrid({ collectionSlug, projectSlug, entries, projectThumbnail }: EntryGridProps) {
  const visitedEntries = useViewerStore((s) => s.visitedEntries);

  return (
    <div className="card-grid card-grid--entries">
      {entries.map((entry) => (
        <GridCard
          key={entry.id}
          href={`/collections/${collectionSlug}/${projectSlug}/${entry.slug}`}
          title={entry.title}
          description={entry.description}
          image={entry.thumbnail ?? projectThumbnail}
          badge={KIND_BADGE[entry.kind]}
          visited={visitedEntries.includes(`${collectionSlug}/${projectSlug}/${entry.slug}`)}
        />
      ))}
    </div>
  );
}
