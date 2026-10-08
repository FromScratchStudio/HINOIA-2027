import { getCollections, getEntry } from "@/lib/data";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ slug: string; projectSlug: string; entrySlug: string }>; }

export async function generateStaticParams() {
  return getCollections().flatMap((c) => c.projects.flatMap((p) => p.entries.map((e) => ({ slug: c.slug, projectSlug: p.slug, entrySlug: e.slug }))));
}
export async function generateMetadata({ params }: Props) { const { slug, projectSlug, entrySlug } = await params; const entry = getEntry(slug, projectSlug, entrySlug); return entry ? { title: `${entry.title} — HINOIA`, description: entry.description } : {}; }

// Couche rendue par AppShell (voir src/app/layout.tsx).
export default async function EntryPage({ params }: Props) {
  const { slug, projectSlug, entrySlug } = await params;
  if (!getEntry(slug, projectSlug, entrySlug)) notFound();
  return null;
}
