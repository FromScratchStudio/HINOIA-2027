import type { StaticImageData } from "next/image";

import assetsThumbnail from "../../public/assets/collections/assets/thumbnail.jpg";
import assetsBibliothequeThumbnail from "../../public/assets/collections/assets/thumbnails/bibliotheque-de-production.jpg";
import behindTheSeenThumbnail from "../../public/assets/collections/behind-the-seen/thumbnail.jpg";
import behindTheSeenMakingOfThumbnail from "../../public/assets/collections/behind-the-seen/thumbnails/making-of-series.jpg";
import dailiesThumbnail from "../../public/assets/collections/dailies/thumbnail.jpg";
import dailiesJournalThumbnail from "../../public/assets/collections/dailies/thumbnails/journal-d-atelier.jpg";
import inspirationsThumbnail from "../../public/assets/collections/inspirations/thumbnail.jpg";
import inspirationsMoodThumbnail from "../../public/assets/collections/inspirations/thumbnails/mood-and-references.jpg";
import lasCasasThumbnail from "../../public/assets/collections/las-casas/thumbnail.jpg";
import lasCasasApologieThumbnail from "../../public/assets/collections/las-casas/thumbnails/apologie-no-apology.jpg";
import lasCasasHumanCircusThumbnail from "../../public/assets/collections/las-casas/thumbnails/human-circus.jpg";
import lasCasasComediaThumbnail from "../../public/assets/collections/las-casas/thumbnails/la-comedia-de-las-casas.jpg";
import lasCasasSkinnedThumbnail from "../../public/assets/collections/las-casas/thumbnails/skinned.jpg";
import lasCasasPimpologistThumbnail from "../../public/assets/collections/las-casas/thumbnails/the-pimpologist.jpg";
import norushThumbnail from "../../public/assets/collections/norush/thumbnail.jpg";
import norushItineranceThumbnail from "../../public/assets/collections/norush/thumbnails/itinerance.jpg";
import norushVieMereThumbnail from "../../public/assets/collections/norush/thumbnails/la-vie-de-ma-mere.jpg";
import norushWhenFreeThumbnail from "../../public/assets/collections/norush/thumbnails/when-i-get-free.jpg";
import roughsThumbnail from "../../public/assets/collections/roughs-and-raws/thumbnail.jpg";
import roughsArchivesThumbnail from "../../public/assets/collections/roughs-and-raws/thumbnails/archives-brutes.jpg";

const THUMBNAIL_ASSET_MAP: Record<string, StaticImageData> = {
  "/assets/collections/norush/thumbnail.jpg": norushThumbnail,
  "/assets/collections/norush/thumbnails/when-i-get-free.jpg": norushWhenFreeThumbnail,
  "/assets/collections/norush/thumbnails/itinerance.jpg": norushItineranceThumbnail,
  "/assets/collections/norush/thumbnails/la-vie-de-ma-mere.jpg": norushVieMereThumbnail,
  "/assets/collections/las-casas/thumbnail.jpg": lasCasasThumbnail,
  "/assets/collections/las-casas/thumbnails/la-comedia-de-las-casas.jpg": lasCasasComediaThumbnail,
  "/assets/collections/las-casas/thumbnails/the-pimpologist.jpg": lasCasasPimpologistThumbnail,
  "/assets/collections/las-casas/thumbnails/apologie-no-apology.jpg": lasCasasApologieThumbnail,
  "/assets/collections/las-casas/thumbnails/human-circus.jpg": lasCasasHumanCircusThumbnail,
  "/assets/collections/las-casas/thumbnails/skinned.jpg": lasCasasSkinnedThumbnail,
  "/assets/collections/roughs-and-raws/thumbnail.jpg": roughsThumbnail,
  "/assets/collections/roughs-and-raws/thumbnails/archives-brutes.jpg": roughsArchivesThumbnail,
  "/assets/collections/behind-the-seen/thumbnail.jpg": behindTheSeenThumbnail,
  "/assets/collections/behind-the-seen/thumbnails/making-of-series.jpg": behindTheSeenMakingOfThumbnail,
  "/assets/collections/dailies/thumbnail.jpg": dailiesThumbnail,
  "/assets/collections/dailies/thumbnails/journal-d-atelier.jpg": dailiesJournalThumbnail,
  "/assets/collections/assets/thumbnail.jpg": assetsThumbnail,
  "/assets/collections/assets/thumbnails/bibliotheque-de-production.jpg": assetsBibliothequeThumbnail,
  "/assets/collections/inspirations/thumbnail.jpg": inspirationsThumbnail,
  "/assets/collections/inspirations/thumbnails/mood-and-references.jpg": inspirationsMoodThumbnail,
};

export interface ResolvedThumbnailPath {
  src: string;
  needsBasePath: boolean;
}

export function resolveThumbnailPath(pathname: string | undefined): ResolvedThumbnailPath | undefined {
  if (!pathname) return undefined;

  const staticAsset = THUMBNAIL_ASSET_MAP[pathname];
  if (staticAsset) {
    return { src: staticAsset.src, needsBasePath: false };
  }

  return { src: pathname, needsBasePath: true };
}
