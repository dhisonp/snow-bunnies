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

export interface HistoricalComparison {
  date: string;
  historicalAvgSnowfall: number; // cm, averaged over 8-10 years
  historicalAvgTemp: number; // Celsius
  forecastSnowfall: number;
  forecastTemp: number;
  confidence: "high" | "medium" | "low";
  caption: string; // AI-generated comparison note
}
