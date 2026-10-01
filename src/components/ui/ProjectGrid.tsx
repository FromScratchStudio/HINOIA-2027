"use client";

import { GridCard } from "@/components/ui/GridCard";
import { useViewerStore } from "@/store/viewer";
import { FORMAT_LABEL } from "@/lib/labels";
import type { Project } from "@/types";

interface ProjectGridProps {
  collectionSlug: string;
  projects: Project[];
}

export function ProjectGrid({ collectionSlug, projects }: ProjectGridProps) {
  const visitedProjects = useViewerStore((s) => s.visitedProjects);

  return (
    <div className="card-grid card-grid--projects">
      {projects.map((project) => (
        <GridCard
          key={project.id}
          href={`/collections/${collectionSlug}/${project.slug}`}
          title={project.title}
          description={project.description}
          badge={project.format ? FORMAT_LABEL[project.format] : project.tags[0]}
          visited={visitedProjects.includes(`${collectionSlug}/${project.slug}`)}
        />
      ))}
    </div>
  );
}
