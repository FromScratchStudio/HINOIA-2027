"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { buildLayers, type LayerModel } from "@/components/ui/Layers";
import { Nav } from "@/components/ui/Nav";
import { parseLayerPath } from "@/lib/layers";
import { useViewerStore } from "@/store/viewer";
import type { Collection, Project, SoundtrackTrack } from "@/types";

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

  useEffect(() => {
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

  const project = useMemo(() => {
    const layerPath = parseLayerPath(pathname);
    if (layerPath.level !== "project" && layerPath.level !== "entry") return null;
    const collection = collections.find((item) => item.slug === layerPath.collection);
    return collection?.projects.find((item) => item.slug === layerPath.project) ?? null;
  }, [collections, pathname]);

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
      <div className="layer-stack" inert={menuOpen || undefined}>
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
      {project?.soundtrack && project.soundtrack.length > 0 && <ProjectPlayer project={project} />}
    </>
  );
}

function ProjectPlayer({ project }: { project: Project }) {
  const tracks = project.soundtrack ?? [];
  const [showPlayer, setShowPlayer] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeTrack = tracks[currentIndex] ?? tracks[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(0);
    setDuration(0);
    audio.pause();
    audio.currentTime = 0;
    audio.load();
    setIsPlaying(false);
  }, [project.slug]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    audio.src = activeTrack.src;
    audio.load();
    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    }
  }, [activeTrack, isPlaying, project.slug]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
      return;
    }
    audio.pause();
  }, [isPlaying, activeTrack]);

  const goToTrack = useCallback((direction: number) => {
    setCurrentIndex((index) => {
      if (tracks.length === 0) return 0;
      return (index + direction + tracks.length) % tracks.length;
    });
  }, [tracks.length]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(audio.currentTime);
    setDuration(audio.duration || 0);
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setProgress(value);
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      setIsPlaying(true);
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
      return;
    }
    audio.pause();
    setIsPlaying(false);
  };

  if (!activeTrack) return null;

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => goToTrack(1)}
        src={activeTrack.src}
      />
      <div className={`soundtrack-player ${showPlayer ? "" : "soundtrack-player--hidden"}`} aria-label={`Lecteur audio du projet ${project.title}`}>
        {showPlayer ? (
          <>
            <div className="soundtrack-player__header">
              <button type="button" className="soundtrack-player__toggle" onClick={() => setShowPlayer(false)} aria-label="Masquer le lecteur audio">
                Cache
              </button>
            </div>
            <div className="soundtrack-player__body">
              <button type="button" className="soundtrack-player__skip" onClick={() => goToTrack(-1)} aria-label="Retourner à la piste précédente">
                ⏮
              </button>
              <button type="button" className="soundtrack-player__play" onClick={togglePlayback} aria-label={isPlaying ? "Mettre en pause" : "Lancer la lecture"}>
                {isPlaying ? "❚❚" : "▶"}
              </button>
              <button type="button" className="soundtrack-player__skip" onClick={() => goToTrack(1)} aria-label="Passer à la piste suivante">
                ⏭
              </button>
              <div className="soundtrack-player__track">
                <button type="button" className="soundtrack-player__title" onClick={() => setShowDetails((value) => !value)}>
                  {activeTrack.title}
                </button>
                <div className="soundtrack-player__meta">
                  <span>{activeTrack.artist ?? "HINOIA"}</span>
                  <span>{formatTime(progress)} / {formatTime(duration)}</span>
                </div>
                <input
                  aria-label="Progression du morceau"
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(progress, duration || progress)}
                  onChange={(event) => handleSeek(Number(event.target.value))}
                />
              </div>
            </div>
          </>
        ) : (
          <button type="button" className="soundtrack-player__chip" onClick={() => setShowPlayer(true)} aria-label="Afficher le lecteur audio">
            <span aria-hidden="true">♪</span>
            <span>{tracks.length} piste{tracks.length > 1 ? "s" : ""}</span>
          </button>
        )}
      </div>

      {showDetails && (
        <div className="soundtrack-modal" role="dialog" aria-modal="true" aria-label={`Détails de ${activeTrack.title}`}>
          <div className="soundtrack-modal__panel">
            <button type="button" className="soundtrack-modal__close" onClick={() => setShowDetails(false)} aria-label="Fermer la fiche du titre">
              ×
            </button>
            <p className="eyebrow">Soundtrack</p>
            <h2>{activeTrack.title}</h2>
            {activeTrack.artist && <p className="soundtrack-modal__artist">{activeTrack.artist}</p>}
            {activeTrack.description && <p className="soundtrack-modal__description">{activeTrack.description}</p>}
            <div className="soundtrack-modal__meta">
              <span>{project.title}</span>
              {activeTrack.duration && <span>{activeTrack.duration}</span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
