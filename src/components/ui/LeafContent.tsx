"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Entry } from "@/types";

interface LeafContentProps {
  entry: Entry;
}

const CHAPTER_MODES = [
  { value: "scroll", label: "Défilement" },
  { value: "fit", label: "Planche" },
  { value: "spread", label: "Double" },
] as const;

type ChapterMode = (typeof CHAPTER_MODES)[number]["value"];

/**
 * Rend une feuille de fin de parcours dans la forme qui lui convient :
 * page rédigée, texte, galerie image, audio, PDF, chapitre illustré, vidéo, ou lien externe.
 */
export function LeafContent({ entry }: LeafContentProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [fullScreenAvailable, setFullScreenAvailable] = useState(false);
  const [chapterMode, setChapterMode] = useState<ChapterMode>("scroll");

  useEffect(() => {
    setFullScreenAvailable(Boolean(document.fullscreenEnabled) && typeof frameRef.current?.requestFullscreen === "function");
    const onChange = () => {
      const isCurrent = document.fullscreenElement === frameRef.current;
      setFullScreen(isCurrent);
      if (!isCurrent) setChapterMode("scroll");
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullScreen = async () => {
    if (!frameRef.current || !fullScreenAvailable) return;
    if (document.fullscreenElement === frameRef.current) {
      await document.exitFullscreen();
      return;
    }
    await frameRef.current.requestFullscreen();
  };

  const selectAdjacentChapterMode = (direction: 1 | -1) => {
    const index = CHAPTER_MODES.findIndex((mode) => mode.value === chapterMode);
    const next = CHAPTER_MODES[(index + direction + CHAPTER_MODES.length) % CHAPTER_MODES.length].value;
    setChapterMode(next);
    return next;
  };

  const onChapterModeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!fullScreen) return;
    if (!event.currentTarget.contains(document.activeElement)) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowDown" && event.key !== "ArrowLeft" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const nextMode = selectAdjacentChapterMode(event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1);
    event.currentTarget.querySelector<HTMLButtonElement>(`button[data-mode="${nextMode}"]`)?.focus();
  };

  let body: ReactNode;
  switch (entry.kind) {
    case "html": {
      if (entry.source === "inline") {
        // Le HTML provient de data/site.json, versionné dans le dépôt : pas de saisie tierce.
        body = <div className="prose" dangerouslySetInnerHTML={{ __html: entry.html }} />;
        break;
      }
      const htmlUrl = entry.source === "asset" ? entry.file : entry.url;
      const internalReference = entry.source === "reference" && entry.url.startsWith("/");
      const sandbox = entry.source === "asset" || internalReference ? "allow-scripts allow-same-origin" : "allow-scripts";
      body = (
        <div>
          <a className="resource-link" href={htmlUrl} target="_blank" rel="noopener noreferrer">
            <span>
              <span className="resource-link__host">{entry.source === "asset" ? "ASSET HTML" : internalReference ? "PAGE INTERNE" : hostOf(entry.url)}</span>
              <span className="resource-link__label">Ouvrir la page</span>
            </span>
            <span className="resource-link__arrow" aria-hidden="true">↗</span>
          </a>
          <iframe
            className="html-frame"
            src={htmlUrl}
            title={`Aperçu — ${entry.title}`}
            sandbox={sandbox}
          />
        </div>
      );
      break;
    }

    case "text":
      body = <article className="plain-text">{entry.text}</article>;
      break;

    case "image":
      if (entry.images.length === 0) {
        body = <p className="empty-state">Aucune image n’est disponible pour ce contenu.</p>;
        break;
      }
      body = (
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
      break;

    case "audio":
      if (entry.source === "embed") {
        body = (
          <div className="audio-frame">
            <iframe
              src={entry.embed}
              title={entry.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          </div>
        );
        break;
      }
      if (entry.tracks.length === 0) {
        body = <p className="empty-state">Aucun audio n’est disponible pour ce contenu.</p>;
        break;
      }
      body = (
        <div className="audio-list">
          {entry.tracks.map((track, index) => (
            <div className="audio-list__track" key={`${track.src}-${index}`}>
              <p>{track.title ?? `Piste ${String(index + 1).padStart(2, "0")}`}</p>
              <audio controls preload="metadata" src={track.src} />
            </div>
          ))}
        </div>
      );
      break;

    case "pdf":
      // L'ouverture directe reste l'action principale : les navigateurs mobiles
      // n'affichent pas de PDF en ligne, et l'aperçu intégré peut échouer.
      body = (
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
      break;

    case "chapter":
      body = (
        <div className="reader">
          {entry.pages.map((src, index) => (
            <div className="reader__page" key={src}>
              <Image src={src} alt={`${entry.title} — planche ${index + 1}`} fill sizes="(max-width: 48rem) 100vw, 46rem" priority={index === 0} />
              <span className="reader__number">{String(index + 1).padStart(2, "0")} / {String(entry.pages.length).padStart(2, "0")}</span>
            </div>
          ))}
        </div>
      );
      break;

    case "video":
      if (!entry.embed && !entry.src) {
        body = <p className="empty-state">Aucune vidéo n’est disponible pour ce contenu.</p>;
        break;
      }
      body = (
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
      break;

    case "link":
      body = (
        <a className="resource-link" href={entry.url} target="_blank" rel="noopener noreferrer">
          <span>
            <span className="resource-link__host">{hostOf(entry.url)}</span>
            <span className="resource-link__label">{entry.label ?? "Ouvrir la ressource"}</span>
          </span>
          <span className="resource-link__arrow" aria-hidden="true">↗</span>
        </a>
      );
      break;

    default: {
      const exhaustiveCheck: never = entry;
      const unhandledKind = (entry as { kind?: string }).kind ?? "inconnu";
      void exhaustiveCheck;
      throw new Error(`Type de contenu non pris en charge: ${String(unhandledKind)}`);
    }
  }

  return (
    <div
      ref={frameRef}
      className={`leaf-viewer leaf-viewer--${entry.kind}${fullScreen ? " is-fullscreen" : ""}`}
      data-reader-mode={entry.kind === "chapter" && fullScreen ? chapterMode : undefined}
    >
      <div className="leaf-viewer__toolbar">
        <p className="leaf-viewer__title">{entry.title}</p>
        {entry.kind === "chapter" && fullScreen && (
          <div className="leaf-viewer__modes" role="radiogroup" aria-label="Mode de lecture plein écran" onKeyDown={onChapterModeKeyDown}>
            {CHAPTER_MODES.map((mode) => {
              const checked = chapterMode === mode.value;
              return (
                <button
                  key={mode.value}
                  data-mode={mode.value}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={checked ? 0 : -1}
                  onClick={() => setChapterMode(mode.value)}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        )}
        <button type="button" className="leaf-viewer__toggle" onClick={() => void toggleFullScreen()} disabled={!fullScreenAvailable}>
          {fullScreen ? "Quitter le plein écran" : "Mode plein écran"}
        </button>
      </div>
      <div className="leaf-viewer__content">{body}</div>
    </div>
  );
}

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
