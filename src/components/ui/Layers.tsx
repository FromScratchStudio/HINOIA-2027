import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChapterList } from "@/components/ui/ChapterList";
import { CollectionGrid } from "@/components/ui/CollectionGrid";
import { EntryGrid } from "@/components/ui/EntryGrid";
import { LeafContent } from "@/components/ui/LeafContent";
import { MarkCollectionVisited } from "@/components/ui/MarkCollectionVisited";
import { MarkEntryVisited } from "@/components/ui/MarkEntryVisited";
import { MarkProjectVisited } from "@/components/ui/MarkProjectVisited";
import { ProjectGrid } from "@/components/ui/ProjectGrid";
import { FORMAT_LABEL, KIND_LABEL } from "@/lib/labels";
import { layerHref, type LayerPath } from "@/lib/layers";
import type { Collection, Entry, Project, ProjectFormat } from "@/types";
import logoImage from "../../../public/logo.png";

export interface LayerModel {
  key: string;
  /** Ordre d'empilement : plus c'est profond, plus la couche est haute. */
  depth: number;
  variant: "welcome" | "grid" | "leaf";
  title: string;
  /** Niveau parent, cible du bouton « Retour ». */
  backHref: string | null;
  content: ReactNode;
}

const WELCOME_DEPTH = 10;

/** Traduit le chemin courant en pile de couches, de la plus basse à la plus haute. */
export function buildLayers(path: LayerPath, collections: Collection[], fallback: ReactNode): LayerModel[] {
  const layers: LayerModel[] = [
    {
      key: "collections",
      depth: 1,
      variant: "grid",
      title: "Collections",
      backHref: "/",
      content: <CollectionsLayer collections={collections} />,
    },
  ];

  if (path.level === "welcome") {
    layers.push({ key: "welcome", depth: WELCOME_DEPTH, variant: "welcome", title: "HINOIA", backHref: null, content: <WelcomeLayer /> });
    return layers;
  }
  if (path.level === "collections") return layers;
  if (path.level === "unknown") return [...layers, missingLayer(fallback, 2)];

  const collection = collections.find((c) => c.slug === path.collection);
  if (!collection) return [...layers, missingLayer(fallback, 2)];
  layers.push({
    key: `c:${collection.slug}`,
    depth: 2,
    variant: "grid",
    title: collection.title,
    backHref: layerHref(),
    content: <CollectionLayer collection={collection} />,
  });
  if (path.level === "collection") return layers;

  const project = collection.projects.find((p) => p.slug === path.project);
  if (!project) return [...layers, missingLayer(fallback, 3)];
  layers.push({
    key: `p:${collection.slug}/${project.slug}`,
    depth: 3,
    variant: "grid",
    title: project.title,
    backHref: layerHref(collection.slug),
    content: <ProjectLayer collection={collection} project={project} />,
  });
  if (path.level === "project") return layers;

  const entry = project.entries.find((e) => e.slug === path.entry);
  if (!entry) return [...layers, missingLayer(fallback, 4)];
  layers.push({
    key: `e:${collection.slug}/${project.slug}/${entry.slug}`,
    depth: 4,
    variant: "leaf",
    title: entry.title,
    backHref: layerHref(collection.slug, project.slug),
    content: <EntryLayer collection={collection} project={project} entry={entry} />,
  });
  return layers;
}

function missingLayer(fallback: ReactNode, depth: number): LayerModel {
  return { key: "missing", depth, variant: "grid", title: "Introuvable", backHref: layerHref(), content: fallback };
}

function LayerHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <header className="layer-header">
      <p className="eyebrow">{eyebrow}</p>
      {/* Cible du focus quand la couche arrive au premier plan. */}
      <h1 tabIndex={-1}>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}

function WelcomeLayer() {
  return (
    <div className="welcome">
      <h1 className="visually-hidden" tabIndex={-1}>HINOIA</h1>
      <Link href={layerHref()} scroll={false} className="welcome__logo" aria-label="Entrer — voir les collections">
        <Image src={logoImage} alt="" priority className="welcome__plate" />
        <span className="welcome__name" aria-hidden="true">
          {"HINOIA".split("").map((letter, i) => <span key={i}>{letter}</span>)}
        </span>
      </Link>
      <p className="welcome__tagline">Un espace de lecture pour les mondes, récits et fragments du studio.</p>
      <p className="welcome__hint" aria-hidden="true">Toucher le logo pour entrer</p>
    </div>
  );
}

function CollectionsLayer({ collections }: { collections: Collection[] }) {
  return (
    <>
      <LayerHeader eyebrow="HINOIA" title="Collections" description="Choisissez un univers pour accéder à ses publications, documents et chapitres." />
      {collections.length === 0 ? <p className="empty-state">Aucune collection n’est encore publiée.</p> : <CollectionGrid collections={collections} />}
    </>
  );
}

function CollectionLayer({ collection }: { collection: Collection }) {
  return (
    <>
      <MarkCollectionVisited slug={collection.slug} />
      <LayerHeader eyebrow="Collection" title={collection.title} description={collection.description} />
      {collection.projects.length === 0 ? (
        <p className="empty-state">Aucun élément n’est encore publié dans cette collection.</p>
      ) : (
        <ProjectGrid collectionSlug={collection.slug} projects={collection.projects} />
      )}
    </>
  );
}

/** Le contenu principal de chaque format de projet ; le reste passe en « Autour du projet ». */
const PRIMARY: Record<ProjectFormat, { kind: Entry["kind"]; heading: string } | null> = {
  series: { kind: "chapter", heading: "Chapitres" },
  oneshot: null,
  wall: null,
  video: { kind: "video", heading: "Vidéos" },
  mixed: null,
};

function ProjectLayer({ collection, project }: { collection: Collection; project: Project }) {
  const format = project.format ?? "mixed";
  const primary = PRIMARY[format];
  const main = primary ? project.entries.filter((e) => e.kind === primary.kind) : [];
  const rest = main.length ? project.entries.filter((e) => e.kind !== primary?.kind) : project.entries;
  const oneShot = format === "oneshot" && project.entries.length > 0 ? project.entries[0] : null;
  // En one-shot, la première entrée est la pièce principale ; les suivantes passent en contenus associés.
  const extra = format === "wall" ? [] : oneShot ? project.entries.slice(1) : rest;
  const eyebrow = [collection.title, project.format && FORMAT_LABEL[project.format]].filter(Boolean).join(" · ");
  const hasExtra = extra.length > 0;
  const showSecondaryHeading = hasExtra && (main.length > 0 || format === "oneshot");
  const secondaryHeading = showSecondaryHeading ? "Autour du projet" : "Contenus";
  const grid = (entries: Entry[]) => <EntryGrid collectionSlug={collection.slug} projectSlug={project.slug} entries={entries} projectThumbnail={project.thumbnail} />;

  return (
    <>
      <MarkProjectVisited collectionSlug={collection.slug} projectSlug={project.slug} />
      <LayerHeader eyebrow={eyebrow} title={project.title} description={project.overview} />
      {project.entries.length === 0 && <p className="empty-state">Aucun contenu n’est encore publié pour ce projet.</p>}
      {oneShot && (
        <section className="layer-section" aria-label={FORMAT_LABEL.oneshot}>
          <h2 className="layer-section__title">{FORMAT_LABEL.oneshot}</h2>
          <OneShotEntry collection={collection} project={project} entry={oneShot} />
        </section>
      )}
      {format === "wall" && project.entries.length > 0 && (
        <section className="layer-section" aria-label={FORMAT_LABEL.wall}>
          <h2 className="layer-section__title">{FORMAT_LABEL.wall}</h2>
          <WallFeed collection={collection} projectSlug={project.slug} entries={project.entries} />
        </section>
      )}
      {primary && main.length > 0 && (
        <section className="layer-section" aria-label={primary.heading}>
          <h2 className="layer-section__title">{primary.heading}</h2>
          {primary.kind === "chapter" ? <ChapterList collectionSlug={collection.slug} projectSlug={project.slug} entries={main} /> : grid(main)}
        </section>
      )}
      {hasExtra && (
        <section className="layer-section" aria-label={secondaryHeading}>
          {showSecondaryHeading && <h2 className="layer-section__title">{secondaryHeading}</h2>}
          {grid(extra)}
        </section>
      )}
    </>
  );
}

function OneShotEntry({ collection, project, entry }: { collection: Collection; project: Project; entry: Entry }) {
  const wide = entry.kind === "pdf" || entry.kind === "video";
  return (
    <article className={wide ? "leaf leaf--wide" : "leaf"}>
      <header className="leaf__header">
        <span className="leaf__kind">{KIND_LABEL[entry.kind]}</span>
        <h3>{entry.title}</h3>
        {entry.description && <p>{entry.description}</p>}
      </header>
      <LeafContent entry={entry} />
      <Link href={layerHref(collection.slug, project.slug, entry.slug)} scroll={false} className="ghost-button">
        Ouvrir en lecture isolée
      </Link>
    </article>
  );
}

function WallFeed({ collection, projectSlug, entries }: { collection: Collection; projectSlug: string; entries: Entry[] }) {
  return (
    <div className="wall-feed">
      {entries.map((entry) => (
        <Link key={entry.id} href={layerHref(collection.slug, projectSlug, entry.slug)} scroll={false} className="wall-card">
          <span className="wall-card__kind">{KIND_BADGE[entry.kind]}</span>
          <h3>{entry.title}</h3>
          {entry.description && <p>{entry.description}</p>}
          <span className="wall-card__arrow" aria-hidden="true">→</span>
        </Link>
      ))}
    </div>
  );
}

function EntryLayer({ collection, project, entry }: { collection: Collection; project: Project; entry: Entry }) {
  const index = project.entries.indexOf(entry);
  const prev = project.entries[index - 1];
  const next = project.entries[index + 1];
  // Le PDF et la vidéo gagnent à occuper toute la largeur ; les planches restent en colonne de lecture.
  const wide = entry.kind === "pdf" || entry.kind === "video";

  return (
    <article className={wide ? "leaf leaf--wide" : "leaf"}>
      <MarkEntryVisited collectionSlug={collection.slug} projectSlug={project.slug} entrySlug={entry.slug} />
      <header className="leaf__header">
        <span className="leaf__kind">{KIND_LABEL[entry.kind]}</span>
        <h1 tabIndex={-1}>{entry.title}</h1>
        {entry.description && <p>{entry.description}</p>}
      </header>
      <LeafContent entry={entry} />
      {(prev || next) && (
        <nav className="pager" aria-label={`Autres contenus de ${project.title}`}>
          {prev ? (
            <Link href={layerHref(collection.slug, project.slug, prev.slug)} scroll={false} className="pager__link">
              <span className="pager__dir">← Précédent</span>
              <span className="pager__title">{prev.title}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={layerHref(collection.slug, project.slug, next.slug)} scroll={false} className="pager__link pager__link--next">
              <span className="pager__dir">Suivant →</span>
              <span className="pager__title">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
