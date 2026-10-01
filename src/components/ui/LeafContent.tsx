import Image from "next/image";
import type { Entry } from "@/types";

interface LeafContentProps {
  entry: Entry;
}

/**
 * Rend une feuille de fin de parcours dans la forme qui lui convient :
 * page rédigée, PDF, chapitre illustré, vidéo, ou lien vers une ressource externe.
 */
export function LeafContent({ entry }: LeafContentProps) {
  switch (entry.kind) {
    case "html":
      // Le HTML provient de data/site.json, versionné dans le dépôt : pas de saisie tierce.
      return <div className="prose" dangerouslySetInnerHTML={{ __html: entry.html }} />;

    case "pdf":
      // L'ouverture directe reste l'action principale : les navigateurs mobiles
      // n'affichent pas de PDF en ligne, et l'aperçu intégré peut échouer.
      return (
        <div>
          <a className="resource-link" href={entry.file} target="_blank" rel="noopener noreferrer">
            <span>
              <span className="resource-link__host">PDF{entry.pageCount ? ` — ${entry.pageCount} pages` : ""}</span>
              <span className="resource-link__label">Ouvrir le document</span>
            </span>
            <span className="resource-link__arrow" aria-hidden="true">↗</span>
          </a>
          <iframe className="pdf-frame" src={entry.file} title={`Aperçu — ${entry.title}`} />
        </div>
      );

    case "chapter":
      return (
        <div className="reader">
          {entry.pages.map((src, index) => (
            <div className="reader__page" key={src}>
              <Image src={src} alt={`${entry.title} — planche ${index + 1}`} fill sizes="(max-width: 48rem) 100vw, 46rem" priority={index === 0} />
              <span className="reader__number">{String(index + 1).padStart(2, "0")} / {String(entry.pages.length).padStart(2, "0")}</span>
            </div>
          ))}
        </div>
      );

    case "video":
      return (
        <div className="video-frame">
          {entry.embed ? (
            <iframe
              src={entry.embed}
              title={entry.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={entry.src} poster={entry.poster} controls playsInline preload="metadata" />
          )}
        </div>
      );

    case "link":
      return (
        <a className="resource-link" href={entry.url} target="_blank" rel="noopener noreferrer">
          <span>
            <span className="resource-link__host">{hostOf(entry.url)}</span>
            <span className="resource-link__label">{entry.label ?? "Ouvrir la ressource"}</span>
          </span>
          <span className="resource-link__arrow" aria-hidden="true">↗</span>
        </a>
      );
  }
}

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
