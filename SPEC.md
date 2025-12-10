# Ski Trip Planner - Technical Specification

## Project Overview

A mobile-first web application for planning ski trips with weather forecasts, crowd predictions, and AI-generated resort insights. No authentication required. Data persisted via LocalStorage.

**Target Users:** Small friend group planning 2-3 ski trips
**Core Value:** Consolidated view of weather, crowds, and local knowledge for selected resorts and date ranges

---

## Technical Stack

### Core

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Font:** Helvetica Neue (fallback: IBM Plex Sans via Google Fonts)

### Data & APIs

- **Weather:** Open-Meteo API (free, no key required)
- **Crowd Data:** SerpAPI Google Popular Times OR direct scraping
- **Community Insights:** Reddit API + forum scraping
- **AI Synthesis:** Google Gemini API (gemini-2.5-flash)

### Storage

- **Client:** LocalStorage for trip configurations
- **Server:** JSON file cache for scraped community data (refreshed weekly)

---

## Environment Variables

```env
# .env.local
GEMINI_API_KEY=AIza...
SERPAPI_KEY=...              # Optional: for Google Popular Times
REDDIT_CLIENT_ID=...         # Optional: for Reddit API
REDDIT_CLIENT_SECRET=...
```

---

## Data Models

### Resort (Static)

```typescript
// /lib/types/resort.ts
interface Resort {
  id: string; // e.g., "heavenly-tahoe"
  name: string; // e.g., "Heavenly"
  region: string; // e.g., "Lake Tahoe"
  state: string; // e.g., "CA"
  coordinates: {
    lat: number;
    lon: number;
  };
  elevation: {
    base: number; // feet
    summit: number;
  };
  trailCount: number;
  liftCount: number;
  terrainPct: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  googlePlaceId?: string; // For Popular Times lookup
  subreddit?: string; // e.g., "tahoe"
  forumUrls?: string[]; // TGR, etc.
}
```

### Trip Configuration (User-Created)

```typescript
// /lib/types/trip.ts
interface TripConfig {
  id: string; // UUID
  resortId: string;
  dateRange: {
    start: string; // ISO date: "2025-12-18"
    end: string; // ISO date: "2025-12-22"
  };
  userProfile: {
    discipline: "ski" | "snowboard";
    skillLevel: "beginner" | "intermediate" | "advanced" | "expert";
  };
  createdAt: string;
  updatedAt: string;
}

// Maximum of 3 trips allowed in LocalStorage
```

### Weather Data

```typescript
// /lib/types/weather.ts
interface DailyWeather {
  date: string; // ISO date
  tempMin: number; // Celsius
  tempMax: number;
  precipitationSum: number; // mm
  snowfallSum: number; // cm
  precipitationProbability: number; // 0-100
  weatherCode: number; // WMO code
  windSpeedMax: number; // km/h
  uvIndexMax: number;
}

interface HistoricalComparison {
  date: string;
  historicalAvgSnowfall: number; // cm, averaged over 8-10 years
  historicalAvgTemp: number; // Celsius
  forecastSnowfall: number;
  forecastTemp: number;
  confidence: "high" | "medium" | "low";
  caption: string; // AI-generated comparison note
}
```

### Crowd Data

```typescript
// /lib/types/crowd.ts
interface HourlyCrowd {
  hour: number; // 0-23
  crowdLevel: number; // 1-5 scale
  source: "google" | "heuristic" | "community";
}

interface DailyCrowd {
  date: string;
  dayType: "weekday" | "weekend" | "holiday";
  holidayName?: string; // e.g., "Christmas Week"
  overallLevel: number; // 1-5
  hourlyBreakdown: HourlyCrowd[];
  peakHours: string; // e.g., "10am-1pm"
  bestArrivalTime: string; // e.g., "Before 8:30am"
  communityNotes?: string[]; // Scraped tips
}
```

### AI-Generated Insights

```typescript
// /lib/types/insights.ts
interface ResortInsights {
  resortId: string;
  generatedAt: string;
  overview: string; // 2-3 sentence resort summary
  localTips: string[]; // 5-8 actionable tips
  bestRunsByLevel: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
    expert: string[];
  };
  hiddenGems: string[]; // Lesser-known spots
  avoidList: string[]; // Tourist traps, bad lifts
  foodRecs: {
    onMountain: string[];
    base: string[];
  };
  parkingStrategy: string;
  crowdPatterns: string; // General crowd behavior
  sources: string[]; // Reddit threads, forums used
}

interface TripBrief {
  tripId: string;
  generatedAt: string;
  weatherFingerprint?: string; // Hash of weather data for cache invalidation
  summary: string; // Personalized 3-4 sentence brief
  dailyGamePlan: {
    date: string;
    recommendation: string; // What to do that day
    bestTimeSlot: string;
    targetZones: string[]; // Areas of mountain to hit
  }[];
  gearConsiderations: string[]; // Based on forecast
  warningsAndAlerts: string[]; // Weather, crowds, closures
}
```

---

## File Structure

```
/ski-trip-planner
├── /app
│   ├── layout.tsx                     # Root layout, fonts, providers
│   ├── page.tsx                       # Main dashboard
│   ├── /api
│   │   ├── /weather
│   │   │   └── route.ts               # Open-Meteo proxy
│   │   ├── /weather-historical
│   │   │   └── route.ts               # Historical weather data
│   │   ├── /crowd
│   │   │   └── route.ts               # Crowd data aggregation
│   │   ├── /insights
│   │   │   ├── /resort
│   │   │   │   └── route.ts           # Static resort insights
│   │   │   └── /trip
│   │   │       └── route.ts           # Personalized trip brief
│   │   └── /scrape
│   │       └── route.ts               # Manual trigger for scraping (dev only)
│   └── /trip
│       └── /[id]
│           └── page.tsx               # Individual trip detail view
├── /components
│   ├── /ui                            # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── tabs.tsx
│   │   └── collapsible.tsx
│   ├── /ResortCard                    # Refactored modular structure
│   │   ├── index.tsx                  # Main orchestrator component
│   │   ├── ResortCardHeader.tsx       # Header with edit/delete
│   │   ├── WeatherSection.tsx         # Weather display section
│   │   ├── CrowdSection.tsx           # Crowd predictions section
│   │   ├── InsightsSection.tsx        # AI insights section
│   │   ├── TripBriefModal.tsx         # Trip brief modal dialog
│   │   ├── PredictionModal.tsx        # Long-range trip warning modal
│   │   ├── CommunityInsightsModal.tsx # Community insights modal
│   │   └── /hooks                     # Custom hooks for data fetching
│   │       ├── useWeatherForecast.ts  # Weather data + historical
│   │       ├── useCrowdData.ts        # Crowd predictions
│   │       ├── useResortInsights.ts   # Resort AI insights
│   │       └── useTripBrief.ts        # Trip brief generation
│   ├── WeatherForecast.tsx            # Daily weather display
│   ├── WeatherIcon.tsx                # Weather icon renderer
│   ├── WeatherPrediction.tsx          # Historical prediction view
│   ├── HistoricalComparison.tsx       # Forecast vs historical
│   ├── SectionHeader.tsx              # Reusable section header
│   ├── CrowdChart.tsx                 # Hourly crowd visualization
│   ├── CrowdDetailPanel.tsx           # Per-day crowd details
│   ├── DayCrowdCard.tsx               # Individual day crowd card
│   ├── TripForm.tsx                   # Create/edit trip modal
│   ├── ResortPicker.tsx               # Resort selection
│   ├── TemperatureContext.tsx         # Temperature unit context
│   ├── TemperatureToggle.tsx          # Metric/Imperial toggle
│   ├── ModeToggle.tsx                 # Dark mode toggle
│   └── ThemeProvider.tsx              # Theme provider
├── /lib
│   ├── /types                         # All TypeScript interfaces
│   │   ├── resort.ts
│   │   ├── trip.ts
│   │   ├── weather.ts
│   │   ├── crowd.ts
│   │   └── insights.ts
│   ├── /data
│   │   ├── resorts.json               # Static resort database
│   │   ├── holidays.json              # US ski season holidays 2025-2026
│   │   └── /cache
│   │       ├── community-insights.json
│   │       └── popular-times.json
│   ├── /services
│   │   ├── open-meteo.ts              # Weather API client
│   │   ├── crowd-estimator.ts         # Crowd calculation logic
│   │   ├── popular-times.ts           # Google Popular Times fetcher
│   │   └── ai-insights.ts             # Gemini API integration
│   ├── /scrapers
│   │   ├── reddit.ts                  # Reddit scraper
│   │   ├── forums.ts                  # TGR and other forums
│   │   └── index.ts                   # Orchestrator
│   ├── storage.ts                     # LocalStorage helpers
│   ├── utils.ts                       # General utilities
│   └── constants.ts                   # App-wide constants
├── /scripts
│   ├── scrape-community.ts            # CLI script for scraping
│   └── seed-resorts.ts                # Generate resorts.json
├── /public
│   └── /fonts
│       └── IBMPlexSans-*.woff2
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
└── .env.local
```

---

## API Specifications

### GET /api/weather

Fetches forecast for a resort and date range.

**Query Parameters:**

- `lat` (number, required): Latitude
- `lon` (number, required): Longitude
- `start` (string, required): Start date ISO
- `end` (string, required): End date ISO
- `elevation` (number, optional): Elevation in meters for accurate snow line

**Response:**

```json
{
  "daily": [
    {
      "date": "2025-12-18",
      "tempMin": -5,
      "tempMax": 2,
      "snowfallSum": 15,
      "precipitationProbability": 80,
      "weatherCode": 73,
      "windSpeedMax": 25,
      "uvIndexMax": 3
    }
  ],
  "units": {
    "temperature": "celsius",
    "snowfall": "cm",
    "wind": "km/h"
  }
}
```

**Implementation Notes:**

- Use Open-Meteo endpoint: `https://api.open-meteo.com/v1/forecast`
- Request parameters: `daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,uv_index_max`
- Set `elevation` parameter for mountain-level accuracy

---

### GET /api/weather-historical

Fetches historical weather data for same date range across past 8-10 years.

**Query Parameters:**

- `lat` (number, required)
- `lon` (number, required)
- `month` (number, required): 1-12
- `dayStart` (number, required): Day of month
- `dayEnd` (number, required): Day of month

**Response:**

```json
{
  "historicalAverages": [
    {
      "dayOfYear": "12-18",
      "avgSnowfall": 8.5,
      "avgTempMin": -7,
      "avgTempMax": 0,
      "snowDayProbability": 65,
      "sampleYears": 10
    }
  ]
}
```

**Implementation Notes:**

- Use Open-Meteo Historical API: `https://archive-api.open-meteo.com/v1/archive`
- Query each year from 2015-2024 for the target date range
- Calculate averages and probabilities
- Cache results (same historical data can be reused)

---

### GET /api/crowd

Returns crowd predictions for a resort and date range.

**Query Parameters:**

- `resortId` (string, required)
- `start` (string, required): Start date ISO
- `end` (string, required): End date ISO

**Response:**

```json
{
  "daily": [
    {
      "date": "2025-12-18",
      "dayType": "weekday",
      "overallLevel": 3,
      "hourlyBreakdown": [
        { "hour": 8, "crowdLevel": 2, "source": "google" },
        { "hour": 9, "crowdLevel": 3, "source": "google" }
      ],
      "peakHours": "10am-1pm",
      "bestArrivalTime": "Before 8:30am",
      "communityNotes": [
        "Thursday before Christmas - expect Bay Area crowds arriving"
      ]
    }
  ]
}
```

**Implementation Notes:**

- Primary: Google Popular Times via SerpAPI or direct scraping
- Fallback: Heuristic calculation based on:
  - Day of week (weekend = +2 levels)
  - Holiday proximity (see holidays.json)
  - Powder day prediction (fresh snow = +1 level)
- Enhance with cached community insights

---

### POST /api/insights/resort

Generates or retrieves cached AI insights for a resort.

**Request Body:**

```json
{
  "resortId": "heavenly-tahoe",
  "forceRefresh": false
}
```

**Response:** Full `ResortInsights` object

**Implementation Notes:**

- Check cache first (`/lib/data/cache/community-insights.json`)
- If miss or `forceRefresh`, call Gemini API with scraped community data
- Cache response with 7-day TTL

**Gemini Prompt Template:**

```
You are a local ski expert synthesizing community knowledge about {resort.name}.

Based on the following community discussions and reviews:
<community_data>
{scraped_content}
</community_data>

Historical context: This data spans discussions from the past 3 years on Reddit and ski forums.

Generate insights in the following JSON structure:
{
  "overview": "2-3 sentence resort character summary",
  "localTips": ["5-8 actionable insider tips"],
  "bestRunsByLevel": {
    "beginner": ["run names"],
    "intermediate": ["run names"],
    "advanced": ["run names"],
    "expert": ["run names"]
  },
  "hiddenGems": ["lesser-known spots locals love"],
  "avoidList": ["tourist traps, inefficient lifts, overpriced spots"],
  "foodRecs": {
    "onMountain": ["lodges/restaurants"],
    "base": ["nearby town spots"]
  },
  "parkingStrategy": "when to arrive, which lots, tips",
  "crowdPatterns": "general crowd behavior and patterns"
}

Be specific. Use actual run names, lift names, and locations. Prioritize actionable advice over generic tips.
```

---

### POST /api/insights/trip

Generates personalized trip brief based on trip config + weather + crowd data.

**Request Body:**

```json
{
  "tripId": "uuid",
  "tripConfig": { ... },
  "weatherData": { ... },
  "crowdData": { ... },
  "resortInsights": { ... }
}
```

**Response:** Full `TripBrief` object

**Gemini Prompt Template:**

```
Generate a personalized ski trip brief.

Trip Details:
- Resort: {resort.name}
- Dates: {dateRange.start} to {dateRange.end}
- Skier Profile: {skillLevel} {discipline}

Weather Forecast:
{weatherData as formatted text}

Historical Comparison:
{historicalComparison}

Crowd Predictions:
{crowdData as formatted text}

Resort Knowledge:
{resortInsights}

Generate a trip brief with:
1. "summary": 3-4 sentence personalized overview of what to expect
2. "dailyGamePlan": For each day, provide:
   - "recommendation": What to prioritize that day given weather/crowds
   - "bestTimeSlot": Optimal skiing hours
   - "targetZones": Specific areas/lifts to focus on for their skill level
3. "gearConsiderations": Based on forecast (goggles, layers, etc.)
4. "warningsAndAlerts": Any concerns (wind holds, holiday crowds, etc.)

Tailor all recommendations to a {skillLevel} {discipline}er. Be specific and actionable.
```

---

## Component Specifications

### ResortCard

Primary display component for each saved trip. **Refactored into modular architecture** with custom hooks and sub-components.

**Props:**

```typescript
interface ResortCardProps {
  trip: TripConfig;
  resort: Resort;
  onEdit: () => void;
  onDelete: () => void;
}
```

**Architecture:**

- **Main Component** (`/components/ResortCard/index.tsx`): Orchestrates data fetching via hooks and renders sub-components
- **Custom Hooks** (`/components/ResortCard/hooks/*`):
  - `useWeatherForecast`: Fetches weather data and historical comparison
  - `useCrowdData`: Fetches crowd predictions
  - `useResortInsights`: Fetches AI-generated resort insights
  - `useTripBrief`: Manages trip brief generation with weather-based cache invalidation
- **Sub-Components**:
  - `ResortCardHeader`: Trip metadata and actions
  - `WeatherSection`: Weather forecast display
  - `CrowdSection`: Crowd predictions with per-day details
  - `InsightsSection`: AI insights preview and actions
  - Modal components for expanded views

**Layout (Mobile-First):**

```
┌─────────────────────────────────────┐
│ [Resort Name]          [Edit] [Del] │
│ Region, State                       │
│ Dec 18-22, 2025                     │
│ Intermediate Snowboarder            │
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ Thu │ │ Fri │ │ Sat │ │ Sun │    │  ← Weather row
│ │ 🌨️  │ │ ⛅  │ │ ☀️  │ │ 🌨️  │    │
│ │-2/3°│ │0/5° │ │-1/4°│ │-3/2°│    │
│ │15cm │ │ 0cm │ │ 0cm │ │20cm │    │
│ └─────┘ └─────┘ └─────┘ └─────┘    │
├─────────────────────────────────────┤
│ Historical: Avg 8cm this week       │
│ "Above average snowfall expected"   │  ← Caption
├─────────────────────────────────────┤
│ Crowd: 🟡 Moderate (Holiday week)   │
│ [▼ Expand hourly breakdown]         │  ← Collapsible
├─────────────────────────────────────┤
│ 💡 AI Tips                          │
│ • Hit Mott Canyon before 10am       │
│ • Avoid gondola—take tram instead   │
│ [View full brief →]                 │
└─────────────────────────────────────┘
```

**States:**

- Loading: Skeleton placeholders for weather/crowd/tips
- Error: Retry button + error message
- Loaded: Full display

---

### CrowdChart

Hourly crowd visualization for a single day.

**Props:**

```typescript
interface CrowdChartProps {
  data: HourlyCrowd[];
  peakHours: string;
  bestArrivalTime: string;
}
```

**Visualization:**

- Horizontal bar chart, hours 7am-5pm
- Color scale: Green (1) → Yellow (3) → Red (5)
- Highlight peak hours with label
- Show "Best time" indicator

---

### TripForm

Modal for creating/editing trips.

**Fields:**

1. Resort picker (searchable dropdown)
2. Date range picker (start + end date)
3. Discipline toggle (Ski / Snowboard)
4. Skill level select (Beginner / Intermediate / Advanced / Expert)

**Validation:**

- Date range: Max 14 days, must be in future
- All fields required

---

## Styling Guidelines

### Design Tokens

```css
/* Colors */
--background: #fafafa;
--foreground: #0a0a0a;
--card: #ffffff;
--card-foreground: #0a0a0a;
--primary: #0f172a; /* Slate 900 */
--primary-foreground: #ffffff;
--muted: #f1f5f9; /* Slate 100 */
--muted-foreground: #64748b; /* Slate 500 */
--accent: #3b82f6; /* Blue 500 - for interactive elements */
--destructive: #ef4444;
--border: #e2e8f0;
--ring: #3b82f6;

/* Crowd level colors */
--crowd-1: #22c55e; /* Green */
--crowd-2: #84cc16; /* Lime */
--crowd-3: #eab308; /* Yellow */
--crowd-4: #f97316; /* Orange */
--crowd-5: #ef4444; /* Red */

/* Spacing */
--radius: 0.5rem;
```

### Typography

```css
/* Font stack */
font-family: "Helvetica Neue", "IBM Plex Sans", system-ui, sans-serif;

/* Scale */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
```

### Mobile-First Breakpoints

```css
/* Base: Mobile (< 640px) */
/* sm: 640px+ */
/* md: 768px+ */
/* lg: 1024px+ */
```

### Component Styling Rules

1. Cards: `rounded-lg border bg-card shadow-sm`
2. Buttons: `rounded-md px-4 py-2 font-medium transition-colors`
3. Inputs: `rounded-md border px-3 py-2 focus:ring-2 focus:ring-accent`
4. No gradients, minimal shadows
5. Generous whitespace (p-4, gap-4 minimum)
6. Icons: Lucide React, 20px default size

---

## Scraping Specifications

### Reddit Scraper

**Target Subreddits:**

- r/skiing
- r/snowboarding
- r/tahoe
- r/colorado (for CO resorts)
- r/icecoast (for East Coast)
- Resort-specific subreddits where they exist

**Search Queries per Resort:**

```
"{resort_name}" site:reddit.com
"{resort_name}" tips OR advice OR locals
"{resort_name}" best runs OR terrain
"{resort_name}" avoid OR crowded OR busy
"{resort_name}" parking OR arrive early
"{resort_name}" food OR lodge OR restaurant
```

**Data Extraction:**

- Post title
- Post body (first 500 chars)
- Top 3 comments (first 300 chars each)
- Post date (filter to last 3 years)
- Upvote count (quality signal)

**Output Format:**

```json
{
  "resortId": "heavenly-tahoe",
  "scrapedAt": "2025-01-15T00:00:00Z",
  "posts": [
    {
      "title": "Local tips for Heavenly?",
      "body": "...",
      "url": "https://reddit.com/...",
      "date": "2024-02-15",
      "score": 45,
      "topComments": ["...", "...", "..."]
    }
  ]
}
```

### Forum Scraper

**Target Forums:**

- TGR (Teton Gravity Research): tetongravity.com/forums
- Epic Mix reviews
- Ikon Pass community

**Approach:**

- Search for resort name
- Extract top 20 recent discussions
- Pull key quotes mentioning tips, crowds, runs

---

## Static Data: resorts.json

Initial resorts to include (expandable):

```json
[
  {
    "id": "heavenly-tahoe",
    "name": "Heavenly",
    "region": "Lake Tahoe",
    "state": "CA/NV",
    "coordinates": { "lat": 38.9353, "lon": -119.94 },
    "elevation": { "base": 6540, "summit": 10067 },
    "trailCount": 97,
    "liftCount": 28,
    "terrainPct": {
      "beginner": 20,
      "intermediate": 45,
      "advanced": 35,
      "expert": 0
    },
    "googlePlaceId": "ChIJ-ZRLfeu5mokRkpGzxwQPKFk",
    "subreddit": "tahoe"
  },
  {
    "id": "palisades-tahoe",
    "name": "Palisades Tahoe",
    "region": "Lake Tahoe",
    "state": "CA",
    "coordinates": { "lat": 39.1969, "lon": -120.2358 },
    "elevation": { "base": 6200, "summit": 9050 },
    "trailCount": 270,
    "liftCount": 37,
    "terrainPct": {
      "beginner": 25,
      "intermediate": 45,
      "advanced": 30,
      "expert": 0
    },
    "googlePlaceId": "ChIJn6YCOWB1mYARGd-4eTMPxuE",
    "subreddit": "tahoe"
  },
  {
    "id": "vail",
    "name": "Vail",
    "region": "Vail Valley",
    "state": "CO",
    "coordinates": { "lat": 39.6061, "lon": -106.355 },
    "elevation": { "base": 8120, "summit": 11570 },
    "trailCount": 195,
    "liftCount": 31,
    "terrainPct": {
      "beginner": 18,
      "intermediate": 29,
      "advanced": 53,
      "expert": 0
    },
    "googlePlaceId": "ChIJKxNo0TF5aIcRZqXVfGqHp1g",
    "subreddit": "vail"
  },
  {
    "id": "park-city",
    "name": "Park City",
    "region": "Park City",
    "state": "UT",
    "coordinates": { "lat": 40.6514, "lon": -111.508 },
    "elevation": { "base": 6800, "summit": 10026 },
    "trailCount": 330,
    "liftCount": 41,
    "terrainPct": {
      "beginner": 8,
      "intermediate": 42,
      "advanced": 50,
      "expert": 0
    },
    "googlePlaceId": "ChIJh5e2sz2LUocRIxIbH9XCBPQ",
    "subreddit": "ParkCity"
  },
  {
    "id": "mammoth",
    "name": "Mammoth Mountain",
    "region": "Eastern Sierra",
    "state": "CA",
    "coordinates": { "lat": 37.6308, "lon": -119.0326 },
    "elevation": { "base": 7953, "summit": 11053 },
    "trailCount": 150,
    "liftCount": 25,
    "terrainPct": {
      "beginner": 25,
      "intermediate": 40,
      "advanced": 35,
      "expert": 0
    },
    "googlePlaceId": "ChIJfcTUyddYp4ARjLwqU2I-y4M",
    "subreddit": "Mammoth"
  }
]
```

---

## Static Data: holidays.json

```json
{
  "2025-2026": [
    { "date": "2025-11-27", "name": "Thanksgiving", "crowdImpact": 3 },
    { "date": "2025-11-28", "name": "Thanksgiving Weekend", "crowdImpact": 4 },
    { "date": "2025-11-29", "name": "Thanksgiving Weekend", "crowdImpact": 5 },
    { "date": "2025-11-30", "name": "Thanksgiving Weekend", "crowdImpact": 4 },
    { "date": "2025-12-20", "name": "Christmas Week Start", "crowdImpact": 3 },
    { "date": "2025-12-21", "name": "Christmas Week", "crowdImpact": 4 },
    { "date": "2025-12-22", "name": "Christmas Week", "crowdImpact": 4 },
    { "date": "2025-12-23", "name": "Christmas Week", "crowdImpact": 5 },
    { "date": "2025-12-24", "name": "Christmas Eve", "crowdImpact": 5 },
    { "date": "2025-12-25", "name": "Christmas Day", "crowdImpact": 4 },
    { "date": "2025-12-26", "name": "Christmas Week", "crowdImpact": 5 },
    { "date": "2025-12-27", "name": "Christmas Week", "crowdImpact": 5 },
    { "date": "2025-12-28", "name": "Christmas Week", "crowdImpact": 5 },
    { "date": "2025-12-29", "name": "Christmas Week", "crowdImpact": 5 },
    { "date": "2025-12-30", "name": "New Year Week", "crowdImpact": 5 },
    { "date": "2025-12-31", "name": "New Year's Eve", "crowdImpact": 4 },
    { "date": "2026-01-01", "name": "New Year's Day", "crowdImpact": 4 },
    { "date": "2026-01-02", "name": "New Year Week", "crowdImpact": 4 },
    { "date": "2026-01-03", "name": "New Year Weekend", "crowdImpact": 5 },
    { "date": "2026-01-04", "name": "New Year Weekend", "crowdImpact": 4 },
    { "date": "2026-01-18", "name": "MLK Weekend", "crowdImpact": 4 },
    { "date": "2026-01-19", "name": "MLK Day", "crowdImpact": 5 },
    { "date": "2026-01-20", "name": "MLK Day", "crowdImpact": 4 },
    { "date": "2026-02-14", "name": "Presidents Week Start", "crowdImpact": 3 },
    { "date": "2026-02-15", "name": "Presidents Week", "crowdImpact": 4 },
    { "date": "2026-02-16", "name": "Presidents Day", "crowdImpact": 5 },
    { "date": "2026-02-17", "name": "Presidents Week", "crowdImpact": 4 },
    { "date": "2026-02-18", "name": "Presidents Week", "crowdImpact": 4 },
    { "date": "2026-02-19", "name": "Presidents Week", "crowdImpact": 4 },
    { "date": "2026-02-20", "name": "Presidents Week", "crowdImpact": 4 },
    { "date": "2026-02-21", "name": "Presidents Weekend", "crowdImpact": 5 },
    { "date": "2026-02-22", "name": "Presidents Weekend", "crowdImpact": 4 }
  ]
}
```

---

## LocalStorage Schema

**Key:** `ski-trip-planner-trips`

```typescript
interface StoredData {
  version: 1;
  trips: TripConfig[];
  lastUpdated: string;
}
```

**Helper Functions (lib/storage.ts):**

```typescript
export function getTrips(): TripConfig[];
export function saveTrip(trip: TripConfig): void;
export function updateTrip(id: string, updates: Partial<TripConfig>): void;
export function deleteTrip(id: string): void;
export function clearAllTrips(): void;
```

---

## Error Handling

### API Errors

All API routes should return consistent error format:

```typescript
interface APIError {
  error: string;
  code: string;
  details?: unknown;
}
```

**Error Codes:**

- `WEATHER_FETCH_FAILED`
- `CROWD_FETCH_FAILED`
- `AI_GENERATION_FAILED`
- `INVALID_RESORT_ID`
- `INVALID_DATE_RANGE`
- `RATE_LIMITED`

### Client-Side Error States

Each data-fetching component should handle:

1. Loading state (skeleton)
2. Error state (message + retry)
3. Empty state (no data)
4. Success state (render data)

---

## Performance Requirements

1. **Initial Load:** < 2s to interactive on 3G
2. **Weather API:** Cache for 1 hour (stale-while-revalidate)
3. **Crowd Data:** Cache for 6 hours
4. **AI Insights:** Cache for 7 days (per resort)
5. **Trip Brief:** Generate on-demand, cache for trip lifetime
6. **Images:** None (text-only UI for speed)

---

## Testing Requirements

### Unit Tests

- Storage helpers
- Date utilities
- Crowd estimation logic
- Weather data transformations

### Integration Tests

- API routes with mocked external services
- Form validation

### E2E Tests (Playwright)

- Create trip flow
- Edit trip flow
- Delete trip flow
- Weather data loads
- Crowd chart renders

---

## Deployment

**Recommended:** Vercel (zero-config for Next.js)

**Environment Setup:**

1. Add env vars in Vercel dashboard
2. Set up cron job for weekly scraping (Vercel Cron or external)

**Build Command:** `next build`
**Output:** Standalone

---

## Development Phases

### Phase 1: Core MVP (Days 1-2)

- [x] Next.js setup with Tailwind + shadcn
- [x] Static resorts.json
- [x] LocalStorage CRUD for trips
- [x] TripForm component
- [x] ResortCard layout (no data)
- [x] Basic page layout

### Phase 2: Weather Integration (Day 3)

- [x] Open-Meteo forecast API
- [x] Open-Meteo historical API
- [x] WeatherForecast component
- [x] HistoricalComparison component (using simple snow summary instead)
- [ ] Cache layer

### Phase 3: Crowd Estimation (Day 4)

- [x] Holidays.json integration
- [x] Heuristic crowd calculator
- [ ] Google Popular Times integration (optional, post-MVP)
- [x] CrowdChart component
- [ ] CrowdCalendar component (post-MVP)

### Phase 4: AI Insights (Day 5)

- [ ] Reddit scraper script (post-MVP)
- [x] Gemini API integration
- [x] Resort insights generation
- [x] Trip brief generation with weather fingerprinting
- [x] InsightsPanel component (integrated into ResortCard)
- [x] Trip brief modal with regeneration capability
- [x] Community insights expansion modal

### Phase 5: Polish (Day 6)

- [x] Error states
- [x] Loading skeletons
- [x] Mobile responsiveness pass
- [x] Dark mode support
- [x] Metric/Imperial temperature toggle
- [x] Enhanced weather icons (sun, rain, cloudy, snow)
- [x] Per-day crowd detail panels
- [x] Section headers with consistent styling
- [x] Trip limit enforcement (max 3 trips)
- [x] Historical comparison with AI-generated captions
- [x] Long-range trip handling (16+ days)
- [ ] PWA setup (optional)
- [x] Deploy to Vercel

---

## Future Enhancements (Out of Scope)

- User authentication
- Trip sharing via URL
- Push notifications for weather alerts
- Multi-resort trip support
- Lift ticket price tracking
- Real-time lift status integration
- Social features (group trips)

---

## Implementation Decisions

1. Historical comparison shows averages with AI-generated context captions ✓
2. Using native HTML date inputs for mobile-first design ✓
3. Max 3 trips in LocalStorage with UI enforcement ✓
4. AI insights cached for 7 days, trip briefs regenerate on weather changes (via fingerprinting) ✓
5. No error tracking service for MVP ✓
6. Trip briefs disabled for trips longer than 16 days (prediction mode) ✓

---

## Reference Links

- Open-Meteo Docs: https://open-meteo.com/en/docs
- Open-Meteo Historical: https://open-meteo.com/en/docs/historical-weather-api
- shadcn/ui: https://ui.shadcn.com
- Lucide Icons: https://lucide.dev
- Reddit API: https://www.reddit.com/dev/api
- SerpAPI: https://serpapi.com/google-popular-times

---

_Spec Version: 1.0_  
_Last Updated: 2025-01-XX_  
_Author: Claude (Anthropic)_
