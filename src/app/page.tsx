import { Nav } from "@/components/ui/Nav";
import { ShowcaseCarousel } from "@/components/ui/ShowcaseCarousel";
import { getShowcase } from "@/lib/data";
import Link from "next/link";

export default function HomePage() {
  const showcase = getShowcase();

  return (
    <>
      <Nav active="home" />

      <main className="flex flex-col min-h-screen">
        {/* Hero */}
        <section className="pt-16 flex flex-col items-center justify-center min-h-[40vh] px-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 mb-6">
            Creative Studio
          </p>
          <h1 className="text-5xl sm:text-7xl font-extralight tracking-[-0.02em] text-white/90 mb-4">
            HINOIA
          </h1>
          <p className="max-w-sm text-sm text-white/40 font-light leading-relaxed">
            Comics &amp; transmedia storytelling studio. Building worlds across
            pages, frames, and formats.
          </p>
          <Link
            href="/collections"
            className="mt-10 inline-block text-[10px] uppercase tracking-[0.4em] text-white/50 hover:text-white/90 border-b border-white/20 hover:border-white/60 pb-0.5 transition-all duration-300"
          >
            Explore collections
          </Link>
        </section>

        {/* Showcase */}
        <section className="mt-12 px-0 sm:px-6 max-w-5xl mx-auto w-full">
          <ShowcaseCarousel items={showcase} />
        </section>

        {/* Footer tag */}
        <footer className="mt-auto py-10 flex justify-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/20">
            HINOIA — 2027
          </span>
        </footer>
      </main>
    </>
  );
}
