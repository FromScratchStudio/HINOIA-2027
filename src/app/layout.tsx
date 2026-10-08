import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { getCollections } from "@/lib/data";
import "./globals.css";

const THEME_INIT = `try{var t=localStorage.getItem("hinoia-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export const metadata: Metadata = {
  title: "HINOIA — Studio créatif",
  description:
    "HINOIA est un studio de bande dessinée et de récit transmédia. Parcourez les collections, les projets et leurs contenus.",
};

// Une seule page à couches : la coquille persiste d'une route à l'autre et dessine
// la pile d'après l'URL. Les pages ne portent que leurs métadonnées et paramètres statiques.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Applique le thème mémorisé avant le premier rendu, pour éviter un flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <AppShell collections={getCollections()}>{children}</AppShell>
      </body>
    </html>
  );
}
