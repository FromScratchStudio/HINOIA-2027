# HINOIA — Creative Studio

A minimalistic, modern web presence for **HINOIA**, a creative studio for comics and transmedia storytelling.

## Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Static Site Generation) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State / Persistence | [Zustand](https://github.com/pmndrs/zustand) + `localStorage` |
| Data | JSON files in `/data` |
| Testing | [Vitest](https://vitest.dev) + Testing Library |

## Project structure

```
src/
  app/                   # Next.js App Router pages
    page.tsx             # Home — hero + showcase carousel
    collections/
      page.tsx           # Collections grid
      [slug]/
        page.tsx         # Collection detail grid
        [projectSlug]/
          page.tsx       # Project detail (overview, drafts, chapters)
  components/ui/         # Reusable UI components
    Nav.tsx
    ShowcaseCarousel.tsx
    GridCard.tsx
  lib/
    data.ts              # JSON data accessors
  store/
    viewer.ts            # Zustand store (persisted to localStorage)
  types/
    index.ts             # Shared TypeScript interfaces
  __tests__/             # Vitest unit tests

data/
  site.json              # Seed data: showcase items + collections/projects

public/assets/           # Local media assets (images, gifs, videos)
```

## Data model

The entire content layer lives in `data/site.json`. No database is required. Assets are referenced by relative URL paths under `public/assets/`.

```
SiteData
├── showcase[]        ShowcaseItem  (image | gif | video)
└── collections[]     Collection
    ├── projects[]    Project
    │   ├── drafts[]  string (image URLs)
    │   └── chapters[] Chapter
    │       └── pages[] string (image URLs)
```

## Getting started

```bash
npm install
npm run dev        # development server at http://localhost:3000
npm run build      # production build
npm test           # run unit tests
npm run lint       # ESLint
```

## Adding content

1. Place assets under `public/assets/<collection-slug>/` (images, GIFs, videos).
2. Edit `data/site.json` to reference them by their `/assets/…` URL.
3. The site rebuilds statically — no API calls, no CMS.

## Local persistence

The viewer's navigation history (visited collections & projects) is persisted in `localStorage` under the key `hinoia-viewer-state` via Zustand's `persist` middleware.
