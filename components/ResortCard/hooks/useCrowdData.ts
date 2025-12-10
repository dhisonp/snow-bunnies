import { useState, useEffect } from "react";
import { type DailyCrowd } from "@/lib/types/crowd";
import { type DailyWeather } from "@/lib/types/weather";
import { Cache } from "@/lib/cache";

interface UseCrowdDataResult {
  crowdData: DailyCrowd[];
  isLoading: boolean;
  error: string | null;
}

export function useCrowdData(
  weatherData: DailyWeather[],
  resortId: string
): UseCrowdDataResult {
  const [crowdData, setCrowdData] = useState<DailyCrowd[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCrowd() {
      if (weatherData.length === 0) {
        setCrowdData([]);
        return;
      }

      const startDate = weatherData[0].date;
      const endDate = weatherData[weatherData.length - 1].date;
      const cacheKey = `crowd-${resortId}-${startDate}-${endDate}`;

      const cached = Cache.get<DailyCrowd[]>(cacheKey);
      if (cached) {
        if (mounted) {
          setCrowdData(cached);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const dates = weatherData.map((d) => d.date);
        const crowdResponse = await fetch("/api/crowd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates, weatherData }),
        });

        if (crowdResponse.ok) {
          const crowdResult = await crowdResponse.json();
          if (mounted) {
            setCrowdData(crowdResult.crowds);
            Cache.set(cacheKey, crowdResult.crowds, 21600); // 6 hours
          }
        } else {
          throw new Error("Failed to fetch crowd data");
        }
      } catch (crowdErr) {
        if (mounted) {
          console.error("Failed to fetch crowd data:", crowdErr);
          setError("Failed to load crowd data");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchCrowd();

    return () => {
      mounted = false;
    };
  }, [weatherData, resortId]);

  return { crowdData, isLoading, error };
}
