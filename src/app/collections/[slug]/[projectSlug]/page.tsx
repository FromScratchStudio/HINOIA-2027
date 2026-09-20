import { Nav } from "@/components/ui/Nav";
import { MarkProjectVisited } from "@/components/ui/MarkProjectVisited";
import { getCollection, getCollections, getProject } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string; projectSlug: string }>;
}

export async function generateStaticParams() {
  return getCollections().flatMap((c) =>
    c.projects.map((p) => ({ slug: c.slug, projectSlug: p.slug }))
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug, projectSlug } = await params;
  const project = getProject(slug, projectSlug);
  if (!project) return {};
  return { title: `${project.title} — HINOIA` };
}

export default async function ProjectPage({ params }: Props) {
  const { slug, projectSlug } = await params;
  const collection = getCollection(slug);
  const project = getProject(slug, projectSlug);
  if (!collection || !project) notFound();

  return (
    <>
      <Nav active="collections" />
      <MarkProjectVisited collectionSlug={slug} projectSlug={projectSlug} />

      <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-12 flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/30">
          <Link href="/collections" className="hover:text-white/60 transition-colors">
            Collections
          </Link>
          <span>/</span>
          <Link href={`/collections/${slug}`} className="hover:text-white/60 transition-colors">
            {collection.title}
          </Link>
          <span>/</span>
          <span className="text-white/60">{project.title}</span>
        </nav>

        {/* Thumbnail */}
        <div className="relative w-full aspect-[2/1] bg-zinc-900 mb-12 overflow-hidden">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        {/* Overview */}
        <section className="mb-16">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 mb-3">
            Overview
          </p>
          <h1 className="text-3xl font-extralight tracking-tight text-white/90 mb-6">
            {project.title}
          </h1>
          <p className="text-sm text-white/50 font-light leading-relaxed max-w-2xl">
            {project.overview}
          </p>
          {project.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase tracking-widest text-white/30 border border-white/10 px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Drafts */}
        {project.drafts.length > 0 && (
          <section className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 mb-8">
              Quick drafts
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-white/5">
              {project.drafts.map((src, i) => (
                <div key={i} className="relative aspect-square bg-zinc-900">
                  <Image
                    src={src}
                    alt={`Draft ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Chapters */}
        {project.chapters.length > 0 && (
          <section>
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 mb-8">
              Chapters
            </p>
            <div className="flex flex-col gap-12">
              {project.chapters.map((chapter) => (
                <div key={chapter.id}>
                  <h2 className="text-base font-light text-white/80 mb-2">
                    {chapter.title}
                  </h2>
                  {chapter.description && (
                    <p className="text-xs text-white/40 mb-6">
                      {chapter.description}
                    </p>
                  )}
                  {chapter.pages.length > 0 && (
                    <div className="flex flex-col gap-px bg-white/5">
                      {chapter.pages.map((src, i) => (
                        <div key={i} className="relative w-full aspect-[3/4] bg-zinc-900">
                          <Image
                            src={src}
                            alt={`${chapter.title} — Page ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="100vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
