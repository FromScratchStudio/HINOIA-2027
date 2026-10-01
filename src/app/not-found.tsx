import Link from "next/link";

// Affichée par AppShell comme couche au-dessus des collections.
export default function NotFound() {
  return (
    <header className="layer-header">
      <p className="eyebrow">Introuvable</p>
      <h1 tabIndex={-1}>Cette page n’existe pas</h1>
      <p>Le lien est peut-être ancien, ou le contenu a été déplacé.</p>
      <Link href="/collections" scroll={false} className="ghost-button">Voir les collections</Link>
    </header>
  );
}
