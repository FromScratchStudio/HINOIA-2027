"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { buildLayers, type LayerModel } from "@/components/ui/Layers";
import { Nav } from "@/components/ui/Nav";
import { withBasePath } from "@/lib/base-path";
import { parseLayerPath } from "@/lib/layers";
import { useViewerStore } from "@/store/viewer";
import type { Collection, Project } from "@/types";

/** Durée de sortie d'une couche ; doit couvrir la transition CSS de `.layer`. */
const LEAVE_MS = 600;

interface AppShellProps {
  collections: Collection[];
  /** Contenu de la route : vide pour les niveaux connus, page « introuvable » sinon. */
  children: ReactNode;
}

/**
 * Coquille unique du site : toutes les routes partagent cette pile de couches,
 * qui reste montée d'une navigation à l'autre. Les couches inférieures gardent
 * leur défilement, la couche qui part s'efface au lieu de disparaître d'un coup.
 */
export function AppShell({ collections, children }: AppShellProps) {
  const pathname = usePathname();
  const layers = useMemo(
    () => buildLayers(parseLayerPath(pathname), collections, children),
    [pathname, collections, children]
  );

  // Couches retirées par la dernière navigation, gardées le temps de leur sortie.
  const [prevLayers, setPrevLayers] = useState(layers);
  const [leaving, setLeaving] = useState<LayerModel[]>([]);
  if (prevLayers !== layers) {
    const kept = new Set(layers.map((l) => l.key));
    setLeaving((current) => {
      const byKey = new Map([...current, ...prevLayers].map((l) => [l.key, l]));
      return [...byKey.values()].filter((l) => !kept.has(l.key));
    });
    setPrevLayers(layers);
  }

  useEffect(() => {
    if (!leaving.length) return;
    const timer = setTimeout(() => setLeaving([]), LEAVE_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  // Le menu reste ouvert tant qu'on ne change pas de couche.
  const [menuOpen, setMenuOpen] = useState(false);
  const onMenuChange = useCallback((open: boolean) => setMenuOpen(open), []);

  const firstMenuMount = useRef(true);
  useEffect(() => {
    if (firstMenuMount.current) {
      firstMenuMount.current = false;
      return;
    }
    setMenuOpen(false);
  }, [pathname]);

  // L'état « consulté » vient du navigateur : on ne le lit qu'après l'hydratation.
  useEffect(() => {
    void useViewerStore.persist.rehydrate();
  }, []);

  const top = layers[layers.length - 1];

  // Au changement de couche, le focus suit le titre de la nouvelle couche.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.querySelector<HTMLElement>(`[data-layer="${CSS.escape(top.key)}"] h1`)?.focus({ preventScroll: true });
  }, [top.key]);

  // Projet porteur de la couche affichee : une feuille reste dans le projet, donc la
  // bande-son continue de jouer d'un contenu a l'autre. La cle inclut la collection
  // pour que deux projets homonymes ne partagent pas l'etat du lecteur.
  const current = useMemo(() => {
    const layerPath = parseLayerPath(pathname);
    if (layerPath.level !== "project" && layerPath.level !== "entry") return null;
    const collection = collections.find((item) => item.slug === layerPath.collection);
    const project = collection?.projects.find((item) => item.slug === layerPath.project);
    if (!project || !collection || !project.soundtrack?.length) return null;
    return { project, key: `${collection.slug}/${project.slug}` };
  }, [collections, pathname]);

  // Le choix « lecteur ouvert / replie » appartient au visiteur : il survit aux
  // changements de projet, contrairement a la piste en cours.
  const [playerOpen, setPlayerOpen] = useState(true);

  const currentKeys = new Set(layers.map((l) => l.key));
  // Les sortantes d'abord : à profondeur égale, la couche qui arrive passe devant.
  const stack = [...leaving.filter((l) => !currentKeys.has(l.key)), ...layers].sort((a, b) => a.depth - b.depth);

  return (
    <>
      <Nav
        backHref={top.backHref}
        onWelcome={top.variant === "welcome"}
        collections={collections}
        pathname={pathname}
        menuOpen={menuOpen}
        onMenuChange={onMenuChange}
      />
      <div className="layer-stack" data-player={current ? (playerOpen ? "open" : "folded") : undefined} inert={menuOpen || undefined}>
        {stack.map((layer) => {
          const state = !currentKeys.has(layer.key) ? "leaving" : layer.key === top.key ? "top" : "under";
          return (
            <section
              key={layer.key}
              data-layer={layer.key}
              data-state={state}
              className={`layer layer--${layer.variant}`}
              style={{ zIndex: layer.depth }}
              aria-label={layer.title}
              inert={state !== "top" || undefined}
            >
              <div className="layer__inner">
                {layer.content}
                {layer.variant !== "welcome" && <footer className="site-footer">HINOIA — Archives vivantes</footer>}
              </div>
            </section>
          );
        })}
      </div>
      {current && (
        <ProjectPlayer
          key={current.key}
          project={current.project}
          open={playerOpen}
          onOpenChange={setPlayerOpen}
          concealed={menuOpen}
        />
      )}
    </>
  );
}

interface ProjectPlayerProps {
  project: Project;
  /** Déplié (barre complète) ou replié (pastille) ; la lecture continue dans les deux cas. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Le menu plein écran recouvre le lecteur : on le neutralise le temps qu'il est ouvert. */
  concealed: boolean;
}

/**
 * Lecteur flottant de la bande-son d'un projet. Monté une fois par projet (clé
 * `collection/projet`), il survit au passage d'un contenu à l'autre : la lecture
 * ne repart pas de zéro quand on ouvre une feuille du même projet.
 *
 * L'élément `<audio>` est la seule source de vérité : `src` est piloté par le
 * rendu — changer l'attribut relance le chargement — et l'état « en lecture »
 * vient de ses évènements `play` / `pause`. Aucun effet ne rappelle `load()`,
 * qui remettrait la piste à son début à chaque pause.
 */
function ProjectPlayer({ project, open, onOpenChange, concealed }: ProjectPlayerProps) {
  const tracks = project.soundtrack ?? [];
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const titleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Vrai quand la piste change alors que la lecture était lancée : la suivante
  // doit enchaîner sans que le visiteur reclique sur « lecture ».
  const resume = useRef(false);
  const headingId = useId();

  const track = tracks[index] ?? tracks[0];
  // Les pistes locales suivent le préfixe de déploiement ; les URL absolues passent telles quelles.
  const src = track ? withBasePath(track.src) : undefined;

  // Le menu plein écran passe devant le lecteur : la fiche n'a plus rien à recouvrir.
  const showDetails = detailsOpen && !concealed;

  // L'élément signale lui-même qu'il recharge : le compteur repart à zéro, et la
  // lecture enchaîne si elle tournait avant le changement de piste.
  const handleLoadStart = () => {
    setProgress(0);
    setDuration(0);
    if (!resume.current) return;
    resume.current = false;
    void audioRef.current?.play().catch(() => undefined);
  };

  // Une feuille audio ou vidéo du projet prend la main : la bande-son se tait
  // plutôt que de jouer par-dessus. `play` ne remonte pas, d'où la capture.
  useEffect(() => {
    const onForeignPlay = (event: Event) => {
      const audio = audioRef.current;
      if (!audio || event.target === audio) return;
      if (event.target instanceof HTMLMediaElement) audio.pause();
    };
    document.addEventListener("play", onForeignPlay, true);
    return () => document.removeEventListener("play", onForeignPlay, true);
  }, []);

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showDetails) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      closeDetails();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showDetails, closeDetails]);

  const skip = useCallback(
    (direction: number) => {
      if (tracks.length < 2) return;
      resume.current = audioRef.current ? !audioRef.current.paused : false;
      setIndex((value) => (value + direction + tracks.length) % tracks.length);
    },
    [tracks.length]
  );

  // Fin de piste : la playlist enchaîne et tourne en boucle.
  const handleEnded = useCallback(() => {
    if (tracks.length < 2) {
      setProgress(0);
      return;
    }
    resume.current = true;
    setIndex((value) => (value + 1) % tracks.length);
  }, [tracks.length]);

  // Choisir une piste dans la fiche la lance, même si le lecteur était en pause.
  const selectTrack = (next: number) => {
    if (next === index) {
      void audioRef.current?.play().catch(() => undefined);
      return;
    }
    resume.current = true;
    setIndex(next);
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setPlaying(false));
      return;
    }
    audio.pause();
  };

  const syncTime = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(audio.currentTime);
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = Math.min(Math.max(value, 0), duration);
    setProgress(audio.currentTime);
  };

  if (!track) return null;

  const total = duration ? formatTime(duration) : track.duration ?? "--:--";
  const multiple = tracks.length > 1;

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadStart={handleLoadStart}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={syncTime}
        onLoadedMetadata={syncTime}
        onDurationChange={syncTime}
        onEnded={handleEnded}
      />
      <div
        className={open ? "soundtrack-player" : "soundtrack-player soundtrack-player--folded"}
        role="region"
        aria-label={`Bande-son — ${project.title}`}
        inert={concealed || undefined}
      >
        {open ? (
          <>
            <div className="soundtrack-player__header">
              <span className="soundtrack-player__count">
                {index + 1} / {tracks.length}
              </span>
              <button
                type="button"
                className="soundtrack-player__fold"
                onClick={() => onOpenChange(false)}
                aria-label="Replier le lecteur de bande-son"
              >
                Masquer
              </button>
            </div>
            <div className="soundtrack-player__body">
              <button
                type="button"
                className="soundtrack-player__skip"
                onClick={() => skip(-1)}
                disabled={!multiple}
                aria-label="Piste précédente"
              >
                <PlayerIcon name="prev" />
              </button>
              <button
                type="button"
                className="soundtrack-player__play"
                onClick={togglePlayback}
                aria-label={playing ? "Mettre en pause" : "Lancer la lecture"}
              >
                <PlayerIcon name={playing ? "pause" : "play"} />
              </button>
              <button
                type="button"
                className="soundtrack-player__skip"
                onClick={() => skip(1)}
                disabled={!multiple}
                aria-label="Piste suivante"
              >
                <PlayerIcon name="next" />
              </button>
              <div className="soundtrack-player__track">
                <button
                  ref={titleRef}
                  type="button"
                  className="soundtrack-player__title"
                  onClick={() => setDetailsOpen((value) => !value)}
                  aria-haspopup="dialog"
                  aria-expanded={showDetails}
                >
                  {track.title}
                </button>
                <input
                  className="soundtrack-player__seek"
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.01}
                  value={duration ? Math.min(progress, duration) : 0}
                  disabled={!duration}
                  aria-label="Progression de la piste"
                  aria-valuetext={`${formatTime(progress)} sur ${total}`}
                  onChange={(event) => seek(Number(event.target.value))}
                />
                <div className="soundtrack-player__meta">
                  <span>{track.artist ?? "HINOIA"}</span>
                  <span>
                    {formatTime(progress)} / {total}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="soundtrack-player__chip"
            onClick={() => onOpenChange(true)}
            aria-label={`Afficher le lecteur de bande-son (${tracks.length} piste${multiple ? "s" : ""})`}
          >
            <PlayerIcon name={playing ? "pause" : "volume"} />
            <span>
              {tracks.length} piste{multiple ? "s" : ""}
            </span>
          </button>
        )}
      </div>

      {showDetails && (
        <div
          className="soundtrack-modal"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeDetails();
          }}
        >
          <div className="soundtrack-modal__panel" role="dialog" aria-modal="true" aria-labelledby={headingId}>
            <button
              ref={closeRef}
              type="button"
              className="soundtrack-modal__close"
              onClick={closeDetails}
              aria-label="Fermer la fiche du titre"
            >
              <span aria-hidden="true">×</span>
            </button>
            <p className="eyebrow">Bande-son</p>
            <h2 id={headingId}>{track.title}</h2>
            {track.artist && <p className="soundtrack-modal__artist">{track.artist}</p>}
            {track.description && <p className="soundtrack-modal__description">{track.description}</p>}
            {multiple && (
              <ol className="soundtrack-modal__list">
                {tracks.map((item, position) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => selectTrack(position)}
                      aria-current={position === index ? "true" : undefined}
                    >
                      <span className="soundtrack-modal__list-index" aria-hidden="true">
                        {String(position + 1).padStart(2, "0")}
                      </span>
                      <span className="soundtrack-modal__list-title">{item.title}</span>
                      {item.duration && <span className="soundtrack-modal__list-time">{item.duration}</span>}
                    </button>
                  </li>
                ))}
              </ol>
            )}
            <div className="soundtrack-modal__meta">
              <span>{project.title}</span>
              <span>
                Piste {index + 1} sur {tracks.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Icône du lecteur, dessinée à partir des silhouettes de `player-icones`.
 * On l'applique en masque CSS plutôt qu'en `<img>` : la couleur suit alors
 * `currentColor`, donc le même fichier blanc sert en thème sombre comme clair.
 * L'URL passe par `withBasePath` pour rester correcte sous un préfixe de déploiement.
 */
function PlayerIcon({ name }: { name: "play" | "pause" | "prev" | "next" | "volume" }) {
  const image = `url("${withBasePath(`/assets/player/${name}.png`)}")`;
  return (
    <span
      className="soundtrack-player__icon"
      aria-hidden="true"
      style={{ maskImage: image, WebkitMaskImage: image }}
    />
  );
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
