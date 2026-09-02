# Delta LandMark Web (Angular 20)

Arabic-first RTL mall website built with **Angular 20**, styled after the Madinet Masr visual system while using content from `data/delta-landmark.json`.

## Run locally

```bash
cd web
npm install
npm start
```

Open `http://localhost:4200`

## Build

```bash
cd web
npm run build
```

Output: `web/dist/delta-landmark-web`

## Project structure

```
src/app/
├── core/                 # Models + services (content, locale)
├── shared/               # Reusable UI (CTAs, sections, pipes, directives)
├── layout/               # Shell, header, footer, loader, burger menu
└── features/             # Route-level pages
    ├── home/sections/    # Home page sections (hero, stats, cards, …)
    ├── brands/
    ├── floor-plan/
    ├── photos/
    └── integrated-experience/
```

## Content

- JSON source: `src/assets/data/delta-landmark.json` (synced from repo root `data/`)
- Images currently load from `originalUrl` in JSON until local `assets/` files are added

## Routes

| Path | Page |
|------|------|
| `/` | Home |
| `/brands` | Brands |
| `/floor-plan` | Floor plan |
| `/photos` | Photo gallery |
| `/integrated-experience` | Integrated experience |

## i18n (Arabic / English)

Translation files (edit these directly):

- `src/assets/i18n/ar.json` — Arabic UI strings
- `src/assets/i18n/en.json` — English UI strings + English page content overlay

Copies are also kept at repo root `assets/i18n/` for convenience.

Structure:

```json
{
  "ui": {
    "nav": { "home": "..." },
    "footer": { "ctaTitle": "..." }
  },
  "content": { ... }   // en.json only — English page content
}
```

Usage in templates:

- `'nav.home' | translate` — UI chrome
- `{{ item.label | localize }}` — JSON content fields (ar/en)

Language toggle saves preference to `localStorage`.

## Animations

- Route transitions on page change
- Scroll-reveal sections (respects `prefers-reduced-motion`)
- Hero ken-burns background + staggered menu items

## Responsive breakpoints

- Mobile: ≤640px
- Tablet: ≤1024px
- Desktop: default
- Large: ≥1440px / ≥1920px
