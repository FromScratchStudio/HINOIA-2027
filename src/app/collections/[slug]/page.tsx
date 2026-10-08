import { getCollection, getCollections } from "@/lib/data";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ slug: string }>; }
export async function generateStaticParams() { return getCollections().map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: Props) { const { slug } = await params; const collection = getCollection(slug); return collection ? { title: `${collection.title} — HINOIA`, description: collection.description } : {}; }

// Couche rendue par AppShell (voir src/app/layout.tsx).
export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  if (!getCollection(slug)) notFound();
  return null;
}
