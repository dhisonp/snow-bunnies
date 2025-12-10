# Ski Trip Planner

Mobile-first web app for planning ski trips with weather forecasts, crowd predictions, and AI-generated resort insights. No authentication—data persisted via LocalStorage.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **APIs**: Open-Meteo (weather), Google Gemini API (insights)
- **Storage**: LocalStorage (trips), JSON file cache (scraped community data)

## Project Structure

```
app/                    # Next.js App Router pages and API routes
  api/                  # API routes: /weather, /crowd, /insights/*
  trip/[id]/            # Individual trip detail view
components/             # React components
  ui/                   # shadcn/ui components
  ResortCard/           # Complex resort card components (index, sub-components, hooks)
lib/
  types/                # TypeScript interfaces (resort, trip, weather, crowd, insights)
  data/                 # Static JSON: resorts.json, holidays.json, cache/
  services/             # API clients: open-meteo, crowd-estimator, ai-insights
  scrapers/             # Reddit and forum scrapers
  storage.ts            # LocalStorage helpers
scripts/                # Utility scripts (generate-insights, etc.)
```

## Development

```bash
npm run dev             # Start dev server
npm run build           # Production build
npm run lint            # Lint code
```

## Key Conventions

- All API routes return `{ error, code, details? }` on failure
- Weather data cached 1 hour, crowd data 6 hours, AI insights 7 days
- Crowd levels use 1-5 scale with color coding (green→red)
- Use `SectionHeader` for consistent section titling
- Use `file:line` references when discussing code locations
- Prioritize code correctness over anything
- Reduce verbose comments
- When creating new components, always refer to `DESIGN.md` for UI/UX guidance
- Run `npm run format` after making final changes

## Reference

- Full specification: `SPEC.md`
- Open-Meteo docs: https://open-meteo.com/en/docs
- shadcn/ui: https://ui.shadcn.com
