import { describe, it, expect } from "vitest";
import {
  getSiteData,
  getCollections,
  getCollection,
  getProject,
  getEntry,
  getShowcase,
} from "@/lib/data";

describe("data helpers", () => {
  it("returns site data with showcase and collections", () => {
    const data = getSiteData();
    expect(data).toHaveProperty("showcase");
    expect(data).toHaveProperty("collections");
  });

  it("getShowcase returns an array", () => {
    const showcase = getShowcase();
    expect(Array.isArray(showcase)).toBe(true);
  });

  it("getCollections returns all collections", () => {
    const collections = getCollections();
    expect(collections.length).toBeGreaterThan(0);
  });

  it("getCollection returns the correct collection by slug", () => {
    const col = getCollection("echoes");
    expect(col).not.toBeNull();
    expect(col?.slug).toBe("echoes");
  });

  it("getCollection returns null for unknown slug", () => {
    expect(getCollection("does-not-exist")).toBeNull();
  });

  it("getProject returns the correct project", () => {
    const project = getProject("echoes", "echo-00");
    expect(project).not.toBeNull();
    expect(project?.slug).toBe("echo-00");
  });

  it("getProject returns null for unknown project", () => {
    expect(getProject("echoes", "nonexistent")).toBeNull();
  });

  it("each collection has required fields", () => {
    for (const col of getCollections()) {
      expect(col).toHaveProperty("id");
      expect(col).toHaveProperty("slug");
      expect(col).toHaveProperty("title");
      expect(col).toHaveProperty("projects");
      expect(Array.isArray(col.projects)).toBe(true);
    }
  });

  it("each project has required fields", () => {
    for (const col of getCollections()) {
      for (const proj of col.projects) {
        expect(proj).toHaveProperty("id");
        expect(proj).toHaveProperty("slug");
        expect(proj).toHaveProperty("title");
        expect(proj).toHaveProperty("entries");
        expect(Array.isArray(proj.entries)).toBe(true);
      }
    }
  });

  it("every entry carries a known leaf kind and its payload", () => {
    const kinds = ["html", "pdf", "chapter", "link", "video"];
    for (const col of getCollections()) {
      for (const proj of col.projects) {
        for (const entry of proj.entries) {
          expect(kinds).toContain(entry.kind);
          if (entry.kind === "html") expect(typeof entry.html).toBe("string");
          if (entry.kind === "pdf") expect(typeof entry.file).toBe("string");
          if (entry.kind === "chapter") expect(Array.isArray(entry.pages)).toBe(true);
          if (entry.kind === "link") expect(typeof entry.url).toBe("string");
          if (entry.kind === "video") expect(Boolean(entry.src || entry.embed)).toBe(true);
        }
      }
    }
  });

  it("entry slugs are unique within a project", () => {
    for (const col of getCollections()) {
      for (const proj of col.projects) {
        const slugs = proj.entries.map((e) => e.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
      }
    }
  });

  it("getEntry resolves a leaf and returns null for an unknown one", () => {
    expect(getEntry("echoes", "echo-00", "presentation")?.kind).toBe("html");
    expect(getEntry("echoes", "echo-00", "nope")).toBeNull();
    expect(getEntry("nope", "echo-00", "presentation")).toBeNull();
  });
});
