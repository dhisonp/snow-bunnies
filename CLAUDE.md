# Ski Trip Planner

Mobile-first web app for planning ski trips with weather forecasts, crowd predictions, and
AI-generated resort insights. No authentication; trips are stored in LocalStorage.

## Stack

- Next.js 14+ (App Router)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Open-Meteo (weather), Google Gemini (insights)
- LocalStorage + JSON cache files

## Repo Map

```
app/                    # Routes, layouts, and API handlers
  api/                  # /weather, /crowd, /insights/*
  spy/                  # Spy mode UI
  trip/[id]/            # Trip detail view
  upcoming/             # Upcoming trips page
components/             # React components
  ResortCard/           # Resort card system
  SpyMode/              # Spy mode components
  ui/                   # shadcn/ui components
lib/
  data/                 # resorts.json, holidays.json, cache/
  services/             # open-meteo, crowd estimator, ai insights
  scrapers/             # Reddit/forum scrapers
  types/                # domain types
  constants/            # app constants
  cache.ts              # cache helpers
  storage.ts            # LocalStorage helpers
  utils.ts              # shared utilities
scripts/                # utility scripts
```

## How To Work

Use the npm scripts in `package.json` (dev, build, lint, format) as needed; details live in
`AGENTS.md`.

## Docs (Progressive Disclosure)

Read only if relevant:

- `SPEC.md` product behavior, API contracts, caching rules
- `DESIGN.md` UI and UX guidance for new components
- `AGENTS.md` coding conventions and agent workflow
- `SPY.md` spy mode design and scoring
- `GEMINI.md` Gemini integration notes
- `TODO.md` current roadmap items

## File Metadata

- Last updated: 2026-01-10
- Previous update: 2025-12-09 (commit 2264aa4)
- Commit summary since previous update:
  - Added Spy mode (API aggregation, scoring/types, page/components)
  - Expanded resort data and refreshed community insights
  - UI polish for mobile layouts, dialogs, metadata, and branding
