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
    case "image":
      return (
        <figure className="media-card">
          <img src={entry.src} alt={entry.alt ?? entry.title} className="media-card__image" loading="lazy" />
          {entry.caption && <figcaption>{entry.caption}</figcaption>}
        </figure>
      );

    case "text":
      if (entry.source === "reference" && entry.href) {
        return (
          <a className="resource-link" href={entry.href} target="_blank" rel="noopener noreferrer">
            <span>
              <span className="resource-link__host">{hostOf(entry.href)}</span>
              <span className="resource-link__label">{entry.title}</span>
            </span>
            <span className="resource-link__arrow" aria-hidden="true">↗</span>
          </a>
        );
      }

      return <div className="prose">{entry.text}</div>;

    case "html":
      if (entry.source === "inline") {
        // Le HTML provient de data/site.json, versionné dans le dépôt : pas de saisie tierce.
        return <div className="prose" dangerouslySetInnerHTML={{ __html: entry.html }} />;
      }
      if (entry.source === "asset") {
        return <iframe className="content-frame" src={entry.src} title={entry.title} />;
      }
      if (entry.source === "reference") {
        return (
          <a className="resource-link" href={entry.url} target="_blank" rel="noopener noreferrer">
            <span>
              <span className="resource-link__host">{hostOf(entry.url)}</span>
              <span className="resource-link__label">Ouvrir la ressource</span>
            </span>
            <span className="resource-link__arrow" aria-hidden="true">↗</span>
          </a>
        );
      }
      return <p className="empty-state">Aucun contenu HTML n’est disponible pour ce document.</p>;

    case "audio":
      return (
        <div className="audio-player">
          {entry.src ? <audio src={entry.src} controls preload="metadata" /> : null}
          {entry.tracks && entry.tracks.length > 0 && (
            <ul className="playlist-list">
              {entry.tracks.map((track) => (
                <li key={track.src}>
                  <audio src={track.src} controls preload="metadata" />
                  {track.title && <span>{track.title}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case "playlist":
      return (
        <div className="audio-player">
          {entry.tracks.map((track) => (
            <div key={track.src} className="playlist-track">
              {track.title && <h3>{track.title}</h3>}
              <audio src={track.src} controls preload="metadata" />
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
          {entry.embed !== false && <iframe className="pdf-frame" src={entry.file} title={`Aperçu — ${entry.title}`} />}
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
