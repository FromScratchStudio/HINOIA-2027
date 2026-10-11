import Image from "next/image";
import type { Entry } from "@/types";

interface LeafContentProps {
  entry: Entry;
}

/**
 * Rend une feuille de fin de parcours dans la forme qui lui convient :
 * page rédigée, texte, galerie image, audio, PDF, chapitre illustré, vidéo, ou lien externe.
 */
export function LeafContent({ entry }: LeafContentProps) {
  switch (entry.kind) {
    case "html":
      if (entry.html) {
        // Le HTML provient de data/site.json, versionné dans le dépôt : pas de saisie tierce.
        return <div className="prose" dangerouslySetInnerHTML={{ __html: entry.html }} />;
      }
      if (!entry.file && !entry.url) {
        return <p className="empty-state">Aucune page HTML n’est disponible pour ce contenu.</p>;
      }
      return (
        <div>
          <a className="resource-link" href={entry.file ?? entry.url!} target="_blank" rel="noopener noreferrer">
            <span>
              <span className="resource-link__host">{entry.file ? "ASSET HTML" : hostOf(entry.url!)}</span>
              <span className="resource-link__label">Ouvrir la page</span>
            </span>
            <span className="resource-link__arrow" aria-hidden="true">↗</span>
          </a>
          <iframe className="html-frame" src={entry.file ?? entry.url!} title={`Aperçu — ${entry.title}`} />
        </div>
      );

    case "text":
      return <article className="plain-text">{entry.text}</article>;

    case "image":
      if (entry.images.length === 0) {
        return <p className="empty-state">Aucune image n’est disponible pour ce contenu.</p>;
      }
      return (
        <div className="image-gallery">
          {entry.images.map((image, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- export statique, dimensions variables
            <img
              key={`${image.src}-${index}`}
              className="image-gallery__item"
              src={image.src}
              alt={image.alt ?? `${entry.title} — image ${index + 1}`}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      );

    case "audio":
      if (entry.embed) {
        return (
          <div className="audio-frame">
            <iframe src={entry.embed} title={entry.title} allow="autoplay; encrypted-media" />
          </div>
        );
      }
      if (!entry.tracks || entry.tracks.length === 0) {
        return <p className="empty-state">Aucun audio n’est disponible pour ce contenu.</p>;
      }
      return (
        <div className="audio-list">
          {entry.tracks.map((track, index) => (
            <div className="audio-list__track" key={`${track.src}-${index}`}>
              <p>{track.title ?? `Piste ${String(index + 1).padStart(2, "0")}`}</p>
              <audio controls preload="metadata" src={track.src} />
            </div>
          ))}
        </div>
      );

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
      if (!entry.embed && !entry.src) {
        return <p className="empty-state">Aucune vidéo n’est disponible pour ce contenu.</p>;
      }
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
            <video src={entry.src!} poster={entry.poster} controls playsInline preload="metadata" />
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
