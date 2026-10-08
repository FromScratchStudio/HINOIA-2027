"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { buildLayers, type LayerModel } from "@/components/ui/Layers";
import { Nav } from "@/components/ui/Nav";
import { parseLayerPath } from "@/lib/layers";
import { useViewerStore } from "@/store/viewer";
import type { Collection } from "@/types";

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
    </>
  );
}
