import { Nav } from "@/components/ui/Nav";
import { CollectionGrid } from "@/components/ui/CollectionGrid";
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
          <CollectionGrid collections={collections} />
        )}
      </main>
    </>
  );
}
