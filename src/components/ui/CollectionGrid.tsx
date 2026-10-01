"use client";

import { GridCard } from "@/components/ui/GridCard";
import { useViewerStore } from "@/store/viewer";
import type { Collection } from "@/types";

interface CollectionGridProps {
  collections: Collection[];
}

export function CollectionGrid({ collections }: CollectionGridProps) {
  const visitedCollections = useViewerStore((s) => s.visitedCollections);

  return (
    <div className="card-grid card-grid--collections">
      {collections.map((col, index) => (
        <GridCard
          key={col.id}
          href={`/collections/${col.slug}`}
          title={col.title}
          description={col.description}
          badge={String(index + 1).padStart(2, "0")}
          visited={visitedCollections.includes(col.slug)}
        />
      ))}
    </div>
  );
}
