import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "@/components/ui/AppShell";
import type { Collection } from "@/types";

// `usePathname` est la seule entrée de la coquille : on la pilote pour simuler la navigation.
let pathname = "/collections/norush/when-i-get-free";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const TRACKS = [
  { id: "t1", title: "Opening drift", artist: "HINOIA Studio", src: "/audio/one.mp3", duration: "2:28", description: "Ambiance lente." },
  { id: "t2", title: "Rooftop walk", artist: "HINOIA Studio", src: "/audio/two.mp3", duration: "3:15" },
  { id: "t3", title: "Last line", artist: "HINOIA Studio", src: "/audio/three.mp3", duration: "2:53" },
];

const collections: Collection[] = [
  {
    id: "c1",
    slug: "norush",
    title: "NORUSH",
    description: "",
    thumbnail: "/assets/collections/norush/thumbnail.jpg",
    projects: [
      {
        id: "p1",
        slug: "when-i-get-free",
        title: "When I get free",
        description: "",
        thumbnail: "/assets/collections/norush/thumbnails/when-i-get-free.jpg",
        tags: [],
        overview: "",
        format: "series",
        soundtrack: TRACKS,
        entries: [
          { id: "e1", slug: "scenario", title: "Scénario", kind: "text", text: "..." },
          { id: "e2", slug: "notes", title: "Notes", kind: "text", text: "..." },
        ],
      },
      {
        id: "p2",
        slug: "itinerance",
        title: "Itinérance",
        description: "",
        thumbnail: "/assets/collections/norush/thumbnails/itinerance.jpg",
        tags: [],
        overview: "",
        format: "series",
        soundtrack: [TRACKS[0]],
        entries: [{ id: "e3", slug: "scenario", title: "Scénario", kind: "text", text: "..." }],
      },
    ],
  },
];

/**
 * jsdom ne lit aucun média : on remplace `play`/`pause` par un couple qui bascule
 * `paused` et émet les évènements, afin de vérifier que le composant n'écrase pas
 * la position de lecture (le bug : `load()` rappelé à chaque pause).
 */
beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "paused", {
    configurable: true,
    get(this: HTMLMediaElement & { _paused?: boolean }) {
      return this._paused ?? true;
    },
  });
  Object.defineProperty(HTMLMediaElement.prototype, "duration", {
    configurable: true,
    get(this: HTMLMediaElement & { _duration?: number }) {
      return this._duration ?? NaN;
    },
  });
  HTMLMediaElement.prototype.play = function play(this: HTMLMediaElement & { _paused?: boolean }) {
    this._paused = false;
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  };
  HTMLMediaElement.prototype.pause = function pause(this: HTMLMediaElement & { _paused?: boolean }) {
    this._paused = true;
    this.dispatchEvent(new Event("pause"));
  };
  HTMLMediaElement.prototype.load = function load() {};
});

function media() {
  const audio = document.querySelector("audio");
  if (!audio) throw new Error("aucun élément audio monté");
  return audio as HTMLAudioElement & { _paused?: boolean; _duration?: number };
}

/** jsdom n'émet aucun évènement média : on les joue à la main, hors de React. */
function emit(type: string) {
  act(() => {
    media().dispatchEvent(new Event(type));
  });
}

/** Simule l'arrivée des métadonnées, que jsdom ne produit jamais seul. */
function loadMetadata(seconds: number) {
  media()._duration = seconds;
  emit("loadedmetadata");
}

beforeEach(() => {
  pathname = "/collections/norush/when-i-get-free";
});

describe("lecteur de bande-son", () => {
  it("n'apparaît qu'au niveau des projets qui définissent une playlist", () => {
    const { rerender } = render(<AppShell collections={collections}>{null}</AppShell>);
    expect(screen.getByRole("region", { name: /Bande-son/ })).toBeInTheDocument();

    pathname = "/collections/norush";
    rerender(<AppShell collections={collections}>{null}</AppShell>);
    expect(screen.queryByRole("region", { name: /Bande-son/ })).not.toBeInTheDocument();
  });

  it("garde la position de lecture d'une pause à l'autre", async () => {
    const user = userEvent.setup();
    render(<AppShell collections={collections}>{null}</AppShell>);
    loadMetadata(148);

    await user.click(screen.getByRole("button", { name: "Lancer la lecture" }));
    const audio = media();
    audio.currentTime = 42;

    await user.click(screen.getByRole("button", { name: "Mettre en pause" }));
    expect(audio.currentTime).toBe(42);

    await user.click(screen.getByRole("button", { name: "Lancer la lecture" }));
    expect(audio.currentTime).toBe(42);
    expect(audio.paused).toBe(false);
  });

  it("enchaîne et revient sur chaque piste de la playlist", async () => {
    const user = userEvent.setup();
    render(<AppShell collections={collections}>{null}</AppShell>);
    const player = screen.getByRole("region", { name: /Bande-son/ });

    expect(within(player).getByRole("button", { name: "Opening drift" })).toBeInTheDocument();
    expect(within(player).getByText("1 / 3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Piste suivante" }));
    expect(within(player).getByRole("button", { name: "Rooftop walk" })).toBeInTheDocument();
    expect(media().src).toContain("/audio/two.mp3");

    await user.click(screen.getByRole("button", { name: "Piste suivante" }));
    expect(within(player).getByRole("button", { name: "Last line" })).toBeInTheDocument();

    // Boucle : après la dernière piste on revient à la première.
    await user.click(screen.getByRole("button", { name: "Piste suivante" }));
    expect(within(player).getByRole("button", { name: "Opening drift" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Piste précédente" }));
    expect(within(player).getByRole("button", { name: "Last line" })).toBeInTheDocument();
    expect(within(player).getByText("3 / 3")).toBeInTheDocument();
  });

  it("poursuit la lecture quand le visiteur change de piste", async () => {
    const user = userEvent.setup();
    render(<AppShell collections={collections}>{null}</AppShell>);

    await user.click(screen.getByRole("button", { name: "Lancer la lecture" }));
    await user.click(screen.getByRole("button", { name: "Piste suivante" }));

    // Le changement de source déclenche `loadstart`, que jsdom n'émet pas.
    emit("loadstart");
    expect(media().paused).toBe(false);
    expect(screen.getByRole("button", { name: "Mettre en pause" })).toBeInTheDocument();
  });

  it("ouvre et ferme la fiche du titre, et permet d'y choisir une piste", async () => {
    const user = userEvent.setup();
    render(<AppShell collections={collections}>{null}</AppShell>);

    const title = screen.getByRole("button", { name: "Opening drift" });
    expect(title).toHaveAttribute("aria-expanded", "false");
    await user.click(title);

    const dialog = screen.getByRole("dialog", { name: "Opening drift" });
    expect(within(dialog).getByText("Ambiance lente.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /Last line/ })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /Last line/ }));
    expect(media().src).toContain("/audio/three.mp3");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("se replie et se redéploie à la demande, sans interrompre la lecture", async () => {
    const user = userEvent.setup();
    render(<AppShell collections={collections}>{null}</AppShell>);

    await user.click(screen.getByRole("button", { name: "Lancer la lecture" }));
    await user.click(screen.getByRole("button", { name: "Replier le lecteur de bande-son" }));

    expect(screen.queryByRole("button", { name: "Mettre en pause" })).not.toBeInTheDocument();
    expect(media().paused).toBe(false);

    await user.click(screen.getByRole("button", { name: /Afficher le lecteur de bande-son/ }));
    expect(screen.getByRole("button", { name: "Mettre en pause" })).toBeInTheDocument();
  });

  it("continue de jouer quand on ouvre un contenu du même projet", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AppShell collections={collections}>{null}</AppShell>);

    await user.click(screen.getByRole("button", { name: "Piste suivante" }));
    await user.click(screen.getByRole("button", { name: "Lancer la lecture" }));
    const before = media();
    before.currentTime = 12;

    pathname = "/collections/norush/when-i-get-free/scenario";
    rerender(<AppShell collections={collections}>{null}</AppShell>);

    expect(media()).toBe(before);
    expect(media().paused).toBe(false);
    expect(media().currentTime).toBe(12);
    expect(screen.getByRole("button", { name: "Rooftop walk" })).toBeInTheDocument();
  });

  it("repart de la première piste quand on passe à un autre projet", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AppShell collections={collections}>{null}</AppShell>);

    await user.click(screen.getByRole("button", { name: "Piste suivante" }));
    await user.click(screen.getByRole("button", { name: "Piste suivante" }));
    expect(screen.getByRole("button", { name: "Last line" })).toBeInTheDocument();

    pathname = "/collections/norush/itinerance";
    rerender(<AppShell collections={collections}>{null}</AppShell>);

    const player = screen.getByRole("region", { name: /Bande-son/ });
    expect(within(player).getByRole("button", { name: "Opening drift" })).toBeInTheDocument();
    expect(within(player).getByText("1 / 1")).toBeInTheDocument();
    // Playlist d'une seule piste : les sauts n'ont rien à atteindre.
    expect(within(player).getByRole("button", { name: "Piste suivante" })).toBeDisabled();
  });

  it("se tait quand un autre média de la page prend la main", async () => {
    const user = userEvent.setup();
    render(<AppShell collections={collections}>{null}</AppShell>);

    await user.click(screen.getByRole("button", { name: "Lancer la lecture" }));
    expect(media().paused).toBe(false);

    // Une feuille audio du projet démarre : la bande-son doit s'effacer.
    const leaf = document.createElement("audio");
    document.body.append(leaf);
    act(() => {
      leaf.dispatchEvent(new Event("play"));
    });

    expect(media().paused).toBe(true);
    expect(screen.getByRole("button", { name: "Lancer la lecture" })).toBeInTheDocument();
    leaf.remove();
  });

  it("n'active la barre de progression qu'une fois la durée connue", () => {
    render(<AppShell collections={collections}>{null}</AppShell>);

    const seek = screen.getByRole("slider", { name: "Progression de la piste" });
    expect(seek).toBeDisabled();
    // Durée inconnue : on affiche celle annoncée par la fiche, pas « 0:00 ».
    expect(screen.getByText("0:00 / 2:28")).toBeInTheDocument();

    loadMetadata(148);
    expect(seek).toBeEnabled();
    expect(seek).toHaveAttribute("max", "148");

    media().currentTime = 60;
    emit("timeupdate");
    expect(screen.getByText("1:00 / 2:28")).toBeInTheDocument();
  });
});
