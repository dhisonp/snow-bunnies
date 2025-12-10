import { useState } from "react";
import { type TripBrief, type ResortInsights } from "@/lib/types/insights";
import { type DailyWeather, type TripComparison } from "@/lib/types/weather";
import { type DailyCrowd } from "@/lib/types/crowd";
import { type TripConfig } from "@/lib/types/trip";
import { type Resort } from "@/lib/types/resort";
import { getTripBrief, saveTripBrief } from "@/lib/storage";

interface UseTripBriefResult {
  tripBrief: TripBrief | null;
  isLoading: boolean;
  error: string | null;
  generateBrief: (
    weatherData: DailyWeather[],
    crowdData: DailyCrowd[],
    insights: ResortInsights | null,
    comparison: TripComparison | null
  ) => Promise<boolean>;
}

export function useTripBrief(
  trip: TripConfig,
  resort: Resort
): UseTripBriefResult {
  const [tripBrief, setTripBrief] = useState<TripBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBrief = async (
    weatherData: DailyWeather[],
    crowdData: DailyCrowd[],
    insights: ResortInsights | null,
    comparison: TripComparison | null
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cached = getTripBrief(trip.id, resort.id);
      if (cached) {
        setTripBrief(cached);
        setIsLoading(false);
        return true;
      }

      const res = await fetch("/api/insights/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripConfig: trip,
          weatherData: weatherData,
          crowdData: crowdData,
          resortInsights: insights,
          historicalComparison: comparison ? comparison.daily : [],
        }),
      });

      if (!res.ok) throw new Error("Failed to generate trip brief");

      const data: TripBrief = await res.json();
      saveTripBrief(trip.id, resort.id, data);
      setTripBrief(data);
      return true;
    } catch (e) {
      console.error(e);
      setError("Failed to generate trip brief.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { tripBrief, isLoading, error, generateBrief };
}
