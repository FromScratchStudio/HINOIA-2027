import { describe, it, expect } from "vitest";
import {
  getSiteData,
  getCollections,
  getCollection,
  getProject,
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
        expect(proj).toHaveProperty("chapters");
        expect(Array.isArray(proj.chapters)).toBe(true);
      }
    }
  });
});
