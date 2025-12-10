import { useState } from "react";
import { type TripBrief, type ResortInsights } from "@/lib/types/insights";
import { type DailyWeather } from "@/lib/types/weather";
import { type DailyCrowd } from "@/lib/types/crowd";
import { type TripConfig } from "@/lib/types/trip";
import { type Resort } from "@/lib/types/resort";
import { getTripBrief, saveTripBrief } from "@/lib/storage";

function getWeatherFingerprint(weather: DailyWeather[]): string {
  return weather
    .map(
      (d) => `${d.date}|${Math.round(d.tempMax)}|${Math.round(d.snowfallSum)}`
    )
    .join(",");
}

interface UseTripBriefResult {
  tripBrief: TripBrief | null;
  isLoading: boolean;
  error: string | null;
  generateBrief: (
    weatherData: DailyWeather[],
    crowdData: DailyCrowd[],
    insights: ResortInsights | null
  ) => Promise<boolean>;
  regenerate: (
    weatherData: DailyWeather[],
    crowdData: DailyCrowd[],
    insights: ResortInsights | null
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
    insights: ResortInsights | null
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const weatherFingerprint = getWeatherFingerprint(weatherData);
      const cached = getTripBrief(trip.id, resort.id);

      if (cached?.weatherFingerprint === weatherFingerprint) {
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
        }),
      });

      if (!res.ok) throw new Error("Failed to generate trip brief");

      const data: TripBrief = await res.json();
      const briefWithFingerprint = { ...data, weatherFingerprint };
      saveTripBrief(trip.id, resort.id, briefWithFingerprint);
      setTripBrief(briefWithFingerprint);
      return true;
    } catch (e) {
      console.error(e);
      setError("Failed to generate trip brief.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const regenerate = async (
    weatherData: DailyWeather[],
    crowdData: DailyCrowd[],
    insights: ResortInsights | null
  ) => {
    localStorage.removeItem(`tripBrief-${trip.id}-${resort.id}`);
    setTripBrief(null);
    return generateBrief(weatherData, crowdData, insights);
  };

  return { tripBrief, isLoading, error, generateBrief, regenerate };
}
