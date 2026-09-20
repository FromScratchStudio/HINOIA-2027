import { describe, it, expect, beforeEach } from "vitest";
import { useViewerStore } from "@/store/viewer";

// Reset store state between tests
beforeEach(() => {
  useViewerStore.setState({
    visitedCollections: [],
    visitedProjects: [],
    lastCollection: null,
  });
});

describe("useViewerStore", () => {
  it("starts with empty visited state", () => {
    const state = useViewerStore.getState();
    expect(state.visitedCollections).toEqual([]);
    expect(state.visitedProjects).toEqual([]);
    expect(state.lastCollection).toBeNull();
  });

  it("markCollectionVisited adds a slug", () => {
    useViewerStore.getState().markCollectionVisited("echoes");
    expect(useViewerStore.getState().visitedCollections).toContain("echoes");
  });

  it("markCollectionVisited is idempotent", () => {
    useViewerStore.getState().markCollectionVisited("echoes");
    useViewerStore.getState().markCollectionVisited("echoes");
    expect(useViewerStore.getState().visitedCollections).toHaveLength(1);
  });

  it("markProjectVisited stores composite key", () => {
    useViewerStore.getState().markProjectVisited("echoes", "echo-00");
    expect(useViewerStore.getState().visitedProjects).toContain(
      "echoes/echo-00"
    );
  });

  it("markProjectVisited is idempotent", () => {
    useViewerStore.getState().markProjectVisited("echoes", "echo-00");
    useViewerStore.getState().markProjectVisited("echoes", "echo-00");
    expect(useViewerStore.getState().visitedProjects).toHaveLength(1);
  });

  it("setLastCollection updates lastCollection", () => {
    useViewerStore.getState().setLastCollection("fragments");
    expect(useViewerStore.getState().lastCollection).toBe("fragments");
  });
});
