export interface DailyWeather {
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

export interface ComparisonResult {
  date: string;
  forecast: {
    snowfall: number;
    tempAvg: number;
  };
  historical: {
    snowfall: number;
    tempAvg: number;
    sampleYears: number;
  };
  delta: {
    snowfall: number; // cm difference
    snowfallPct: number; // % above/below avg
    temp: number; // °C difference
  };
  verdict: "above_avg" | "average" | "below_avg";
  confidence: "high" | "medium" | "low";
}

export interface TripComparison {
  daily: ComparisonResult[];
  summary: {
    totalForecastSnow: number;
    totalHistoricalSnow: number;
    snowfallVerdict: string; // "25% above average"
    tempVerdict: string; // "2°C colder than usual"
    bestDay: string; // "Saturday looks best"
    caption: string; // AI-friendly summary
  };
}
