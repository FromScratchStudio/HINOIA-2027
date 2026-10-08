import { describe, it, expect } from "vitest";
import { layerHref, parseLayerPath } from "@/lib/layers";

describe("parseLayerPath", () => {
  it("opens on the welcome layer at the root", () => {
    expect(parseLayerPath("/")).toEqual({ level: "welcome" });
    expect(parseLayerPath(null)).toEqual({ level: "welcome" });
  });

  it("resolves each depth of the collections tree", () => {
    expect(parseLayerPath("/collections")).toEqual({ level: "collections" });
    expect(parseLayerPath("/collections/echoes/")).toEqual({ level: "collection", collection: "echoes" });
    expect(parseLayerPath("/collections/echoes/echo-00")).toEqual({
      level: "project",
      collection: "echoes",
      project: "echo-00",
    });
    expect(parseLayerPath("/collections/echoes/echo-00/chapitre-1")).toEqual({
      level: "entry",
      collection: "echoes",
      project: "echo-00",
      entry: "chapitre-1",
    });
  });

  it("flags paths outside the tree", () => {
    expect(parseLayerPath("/about")).toEqual({ level: "unknown" });
    expect(parseLayerPath("/collections/a/b/c/d")).toEqual({ level: "unknown" });
  });
});

describe("layerHref", () => {
  it("builds hrefs matching parseLayerPath", () => {
    expect(layerHref()).toBe("/collections");
    expect(layerHref("echoes", "echo-00", "chapitre-1")).toBe("/collections/echoes/echo-00/chapitre-1");
  });
});
