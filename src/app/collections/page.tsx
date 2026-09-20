import { Nav } from "@/components/ui/Nav";
import { GridCard } from "@/components/ui/GridCard";
import { getCollections } from "@/lib/data";

export const metadata = {
  title: "Collections — HINOIA",
  description: "Browse all HINOIA publication collections.",
};

export default function CollectionsPage() {
  const collections = getCollections();

  return (
    <>
      <Nav active="collections" />

      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto w-full">
        <header className="mb-16">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 mb-3">
            All work
          </p>
          <h1 className="text-3xl font-extralight tracking-tight text-white/90">
            Collections
          </h1>
        </header>

        {collections.length === 0 ? (
          <p className="text-white/30 text-sm">No collections yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {collections.map((col) => (
              <GridCard
                key={col.id}
                href={`/collections/${col.slug}`}
                thumbnail={col.thumbnail}
                title={col.title}
                description={col.description}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
