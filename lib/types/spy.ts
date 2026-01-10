import type { DailyWeather } from "./weather";
import type { Resort } from "./resort";

export type RidabilityLabel = "Poor" | "Fair" | "Good" | "Great" | "Prime";

export interface Ridability {
  score: number; // 0-100
  label: RidabilityLabel;
  reasons: string[];
}

export interface BestWindow {
  window: string; // "8:30am–11:30am"
  note: string;
}

export interface RecentWeather {
  rainMm: number;
  snowCm: number;
  tempMin: number;
  tempMax: number;
  refreezeIndex?: number; // Internal metric, maybe export if needed
}

export interface SpyDayData {
  date: string;
  weather: DailyWeather;
  ridability: Ridability;
  bestWindow?: BestWindow;
  notes?: string[];
}

export interface SpyModeResponse {
  resort: Resort;
  days: number;
  data: SpyDayData[];
  recent: RecentWeather;
}
