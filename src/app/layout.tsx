import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Jost } from "next/font/google";
import { AppShell } from "@/components/ui/AppShell";
import { getCollections } from "@/lib/data";
import "./globals.css";

// Géométrique, large, léger — la lettre des maquettes.
const jost = Jost({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "HINOIA — Studio créatif",
  description:
    "HINOIA est un studio de bande dessinée et de récit transmédia. Parcourez les collections, les projets et leurs contenus.",
};

// Une seule page à couches : la coquille persiste d'une route à l'autre et dessine
// la pile d'après l'URL. Les pages ne portent que leurs métadonnées et paramètres statiques.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={jost.variable}>
      <body>
        <AppShell collections={getCollections()}>{children}</AppShell>
      </body>
    </html>
  );
}
