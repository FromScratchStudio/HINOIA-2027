import type { SiteData } from "@/types";
import siteData from "../../data/site.json";

export function getSiteData(): SiteData {
  return siteData as SiteData;
}

export function getCollections() {
  return getSiteData().collections;
}

export function getCollection(slug: string) {
  return getCollections().find((c) => c.slug === slug) ?? null;
}

export function getProject(collectionSlug: string, projectSlug: string) {
  const collection = getCollection(collectionSlug);
  if (!collection) return null;
  return collection.projects.find((p) => p.slug === projectSlug) ?? null;
}

export function getShowcase() {
  return getSiteData().showcase;
}
