"use client";

import { GridCard } from "@/components/ui/GridCard";
import { useViewerStore } from "@/store/viewer";

interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
}

interface CollectionGridProps {
  collections: Collection[];
}

export function CollectionGrid({ collections }: CollectionGridProps) {
  const visitedCollections = useViewerStore((s) => s.visitedCollections);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
      {collections.map((col) => (
        <GridCard
          key={col.id}
          href={`/collections/${col.slug}`}
          thumbnail={col.thumbnail}
          title={col.title}
          description={col.description}
          visited={visitedCollections.includes(col.slug)}
        />
      ))}
    </div>
  );
}
