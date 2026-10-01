"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { layerHref } from "@/lib/layers";
import type { Collection } from "@/types";

interface NavProps {
  /** Niveau parent ; absent sur l'accueil. */
  backHref: string | null;
  /** Sur la couche d'accueil, seul le menu reste visible : le logo occupe le centre. */
  onWelcome: boolean;
  collections: Collection[];
  pathname: string;
  menuOpen: boolean;
  onMenuChange: (open: boolean) => void;
}

/** Barre fixe au-dessus de toutes les couches : retour d'un niveau, mot-symbole, menu. */
export function Nav({ backHref, onWelcome, collections, pathname, menuOpen, onMenuChange }: NavProps) {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onMenuChange(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, onMenuChange]);

  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <>
      <header className={onWelcome ? "site-header site-header--welcome" : "site-header"}>
        <div className="site-header__start">
          {backHref && (
            <Link href={backHref} scroll={false} className="back-link">
              <span aria-hidden="true">←</span> Retour
            </Link>
          )}
        </div>
        {!onWelcome && (
          <Link href="/" scroll={false} className="wordmark">
            HINOIA
          </Link>
        )}
        <div className="site-header__end">
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="app-menu"
            onClick={() => onMenuChange(!menuOpen)}
          >
            {menuOpen ? "Fermer" : "Menu"}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          ref={menuRef}
          id="app-menu"
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
          // Un lien vers la couche déjà affichée ne change pas l'URL : on ferme quand même.
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) onMenuChange(false);
          }}
        >
          <nav className="menu__inner">
            <ul className="menu__primary">
              <li><Link href="/" scroll={false} aria-current={current("/")}>Accueil</Link></li>
              <li><Link href={layerHref()} scroll={false} aria-current={current(layerHref())}>Collections</Link></li>
            </ul>
            <ul className="menu__tree">
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link href={layerHref(collection.slug)} scroll={false} className="menu__collection" aria-current={current(layerHref(collection.slug))}>
                    {collection.title}
                  </Link>
                  {collection.projects.length > 0 && (
                    <ul>
                      {collection.projects.map((project) => {
                        const href = layerHref(collection.slug, project.slug);
                        return (
                          <li key={project.id}>
                            <Link href={href} scroll={false} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined}>
                              {project.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
