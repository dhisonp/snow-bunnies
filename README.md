# Snow Bunnies

Ski trip planning application combining real-time weather data, crowd
predictions, and AI-powered resort insights.

<img width="815" height="540" alt="Screenshot 2025-12-09 at 10 44 05 PM" src="https://github.com/user-attachments/assets/563f05ec-d577-438a-8cc2-75ae612fa53b" />
<img width="815" height="540" alt="Screenshot 2025-12-09 at 10 44 27 PM" src="https://github.com/user-attachments/assets/7358187d-b4a7-4627-91d2-ed6e794af9df" />



## Architecture

**Client-Side State Management**  
Uses browser LocalStorage for trip persistence, eliminating backend
infrastructure while maintaining data privacy and enabling offline
functionality.

**Hybrid Data Strategy**

- Weather forecasts from Open-Meteo API (1-hour cache)
- Crowd predictions using historical patterns and holiday calendars (6-hour
  cache)
- AI-generated insights (7-day cache)

**API-First Design**  
External integrations abstracted through Next.js API routes, providing
separation between data sources and UI components.

**Mobile-First UI**  
Brutalist design using Tailwind CSS and shadcn/ui, prioritizing information
density and rapid comprehension.

## Technology Stack

- **Framework**: Next.js 14 (App Router), TypeScript strict mode
- **UI**: Tailwind CSS, shadcn/ui
- **AI**: Anthropic Claude API
- **Weather**: Open-Meteo API
- **Storage**: Browser LocalStorage

## Features

- Predictive crowd modeling using holiday calendars and historical patterns
- 16-day weather forecasts with historical data fallback
- Skill-adaptive AI recommendations
- Zero authentication required
- Offline support with intelligent caching

## Roadmap

**Composite Scoring System**  
Multi-factor scoring algorithm combining weather conditions, crowd density, and
historical data into a normalized quality metric.

**Accommodation Intelligence**  
AI-powered lodging recommendations using web scraping and NLP to match budget
constraints with proximity requirements.

**Real-Time Forum Analysis**  
NLP-based sentiment analysis of ski forum discussions to extract operational
status updates and condition reports.

**Live Occupancy Data**  
Integration with Google Places API for real-time parking lot capacity monitoring
and crowd validation.

**Seasonal Crowd Heatmaps**  
Calendar-based visualization of historical and predicted crowd patterns for
multi-month trip planning.

**User-Contributed Resort Data**  
Community-driven resort database expansion with validation and moderation
workflows.

## Development

```bash
npm install
npm run dev       # Development server
npm run build     # Production build
npm run lint      # Code linting
npm run format    # Code formatting
```

## License

MIT
