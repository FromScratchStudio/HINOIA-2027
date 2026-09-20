import { Nav } from "@/components/ui/Nav";
import { ProjectGrid } from "@/components/ui/ProjectGrid";
import { MarkCollectionVisited } from "@/components/ui/MarkCollectionVisited";
import { getCollection, getCollections } from "@/lib/data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCollections().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  return { title: `${collection.title} — HINOIA` };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  return (
    <>
      <Nav active="collections" />
      <MarkCollectionVisited slug={collection.slug} />

      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto w-full">
        <header className="mb-16">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 mb-3">
            Collection
          </p>
          <h1 className="text-3xl font-extralight tracking-tight text-white/90 mb-3">
            {collection.title}
          </h1>
          <p className="max-w-md text-sm text-white/40 font-light leading-relaxed">
            {collection.description}
          </p>
        </header>

        {collection.projects.length === 0 ? (
          <p className="text-white/30 text-sm">No projects in this collection yet.</p>
        ) : (
          <ProjectGrid collectionSlug={collection.slug} projects={collection.projects} />
        )}
      </main>
    </>
  );
}
