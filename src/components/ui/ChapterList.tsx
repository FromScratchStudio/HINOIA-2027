"use client";

import Link from "next/link";
import { layerHref } from "@/lib/layers";
import { useViewerStore } from "@/store/viewer";
import type { Entry } from "@/types";

interface ChapterListProps {
  collectionSlug: string;
  projectSlug: string;
  entries: Entry[];
}

/** Sommaire d'une série : les chapitres se lisent dans l'ordre, donc en liste numérotée. */
export function ChapterList({ collectionSlug, projectSlug, entries }: ChapterListProps) {
  const visitedEntries = useViewerStore((s) => s.visitedEntries);

  return (
    <ol className="chapter-list">
      {entries.map((entry, index) => (
        <li key={entry.id}>
          <Link href={layerHref(collectionSlug, projectSlug, entry.slug)} className="chapter-row" scroll={false}>
            <span className="chapter-row__number">{String(index + 1).padStart(2, "0")}</span>
            <span className="chapter-row__body">
              <span className="chapter-row__title">{entry.title}</span>
              {entry.description && <span className="chapter-row__description">{entry.description}</span>}
            </span>
            {visitedEntries.includes(`${collectionSlug}/${projectSlug}/${entry.slug}`) && (
              <span className="grid-card__status">Lu</span>
            )}
            <span className="chapter-row__arrow" aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
