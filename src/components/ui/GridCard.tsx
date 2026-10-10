import Link from "next/link";
import { withBasePath } from "@/lib/base-path";
import { resolveThumbnailPath } from "@/lib/thumbnail-paths";

interface GridCardProps {
  href: string;
  title: string;
  description?: string;
  badge?: string;
  /** Image révélée au survol de la tuile. */
  image?: string;
  visited?: boolean;
  /** Ressource externe : ouvre dans un nouvel onglet plutôt que de naviguer. */
  external?: boolean;
}

export function GridCard({ href, title, description, badge, image, visited, external }: GridCardProps) {
  const resolvedImage = resolveThumbnailPath(image);
  const imageSrc = resolvedImage
    ? resolvedImage.needsBasePath
      ? withBasePath(resolvedImage.src)
      : resolvedImage.src
    : undefined;

  const inner = (
    <>
      {imageSrc && (
        // eslint-disable-next-line @next/next/no-img-element -- export statique, images non optimisées
        <img className="grid-card__image" src={imageSrc} alt="" loading="lazy" decoding="async" />
      )}
      <div className="grid-card__topline">{badge && <span>{badge}</span>}{visited && <span className="grid-card__status">Consulté</span>}</div>
      <div className="grid-card__body"><h2>{title}</h2>{description && <p>{description}</p>}</div>
      <span className="grid-card__arrow" aria-hidden="true">{external ? "↗" : "→"}</span>
    </>
  );

  const cls = image ? "grid-card grid-card--image" : "grid-card";

  if (external) {
    return <a href={href} className={cls} target="_blank" rel="noopener noreferrer">{inner}</a>;
  }

  // La pile de couches gère son propre défilement : pas de remise en haut de la fenêtre.
  return <Link href={href} className={cls} scroll={false}>{inner}</Link>;
}
