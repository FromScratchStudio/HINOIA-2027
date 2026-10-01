import { getCollections, getProject } from "@/lib/data";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ slug: string; projectSlug: string }>; }
export async function generateStaticParams() { return getCollections().flatMap((c) => c.projects.map((p) => ({ slug: c.slug, projectSlug: p.slug }))); }
export async function generateMetadata({ params }: Props) { const { slug, projectSlug } = await params; const project = getProject(slug, projectSlug); return project ? { title: `${project.title} — HINOIA`, description: project.description } : {}; }

// Couche rendue par AppShell (voir src/app/layout.tsx).
export default async function ProjectPage({ params }: Props) {
  const { slug, projectSlug } = await params;
  if (!getProject(slug, projectSlug)) notFound();
  return null;
}
