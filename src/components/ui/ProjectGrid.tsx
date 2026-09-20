"use client";

import { GridCard } from "@/components/ui/GridCard";
import { useViewerStore } from "@/store/viewer";

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
}

interface ProjectGridProps {
  collectionSlug: string;
  projects: Project[];
}

export function ProjectGrid({ collectionSlug, projects }: ProjectGridProps) {
  const visitedProjects = useViewerStore((s) => s.visitedProjects);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-white/5">
      {projects.map((project) => (
        <GridCard
          key={project.id}
          href={`/collections/${collectionSlug}/${project.slug}`}
          thumbnail={project.thumbnail}
          title={project.title}
          description={project.description}
          badge={project.tags[0]}
          visited={visitedProjects.includes(`${collectionSlug}/${project.slug}`)}
        />
      ))}
    </div>
  );
}
