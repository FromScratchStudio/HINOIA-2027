import Link from "next/link";

interface GridCardProps {
  href: string;
  title: string;
  description?: string;
  badge?: string;
  visited?: boolean;
  /** Ressource externe : ouvre dans un nouvel onglet plutôt que de naviguer. */
  external?: boolean;
}

export function GridCard({ href, title, description, badge, visited, external }: GridCardProps) {
  const inner = (
    <>
      <div className="grid-card__topline">{badge && <span>{badge}</span>}{visited && <span className="grid-card__status">Consulté</span>}</div>
      <div className="grid-card__body"><h2>{title}</h2>{description && <p>{description}</p>}</div>
      <span className="grid-card__arrow" aria-hidden="true">{external ? "↗" : "→"}</span>
    </>
  );

  if (external) {
    return <a href={href} className="grid-card" target="_blank" rel="noopener noreferrer">{inner}</a>;
  }

  // La pile de couches gère son propre défilement : pas de remise en haut de la fenêtre.
  return <Link href={href} className="grid-card" scroll={false}>{inner}</Link>;
}
