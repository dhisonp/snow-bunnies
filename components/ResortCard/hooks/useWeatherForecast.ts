import { useState, useEffect } from "react";
import { type DailyWeather, type TripComparison } from "@/lib/types/weather";
import { compareWeatherData } from "@/lib/services/weather-comparison";
import { type Resort } from "@/lib/types/resort";
import { type TripConfig } from "@/lib/types/trip";
import { Cache } from "@/lib/cache";

interface UseWeatherForecastResult {
  forecast: DailyWeather[];
  isHistorical: boolean;
  comparison: TripComparison | null;
  isLoading: boolean;
  error: string | null;
}

export function useWeatherForecast(
  resort: Resort,
  trip: TripConfig
): UseWeatherForecastResult {
  const [forecast, setForecast] = useState<DailyWeather[]>([]);
  const [isHistorical, setIsHistorical] = useState(false);
  const [comparison, setComparison] = useState<TripComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchWeather() {
      try {
        setIsLoading(true);
        setError(null);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const maxForecastDate = new Date(today);
        maxForecastDate.setDate(today.getDate() + 15); // 16 days total (0-15)

        const startDate = new Date(trip.dateRange.start);
        startDate.setHours(0, 0, 0, 0);

        // Cache Key
        const cacheKey = `weather-${resort.id}-${trip.dateRange.start}-${trip.dateRange.end}`;

        // Case 1: Trip is completely in the future beyond 16 days -> Historical only
        if (startDate > maxForecastDate) {
          // Check Cache
          const cached = Cache.get<DailyWeather[]>(cacheKey);
          if (cached) {
            if (mounted) {
              setForecast(cached);
              setIsHistorical(true);
              setComparison(null);
              setIsLoading(false);
            }
            return;
          }

          try {
            const params = new URLSearchParams({
              lat: resort.coordinates.lat.toString(),
              lon: resort.coordinates.lon.toString(),
              start: trip.dateRange.start,
              end: trip.dateRange.end,
            });
            const res = await fetch(
              `/api/weather-historical?${params.toString()}`
            );
            if (res.ok) {
              const historicalData = await res.json();
              if (mounted) {
                setForecast(historicalData);
                setIsHistorical(true);
                setComparison(null);
                // Cache for 1 hour
                Cache.set(cacheKey, historicalData, 3600);
              }
            } else {
              throw new Error("Failed to fetch historical weather");
            }
          } catch (e) {
            console.error("Failed to fetch historical weather", e);
            if (mounted) setError("Failed to load historical weather");
          }
          if (mounted) setIsLoading(false);
          return;
        }

        // Case 2: Trip is within forecast range (at least partially)
        const cached = Cache.get<DailyWeather[]>(cacheKey);

        if (cached && mounted) {
          setForecast(cached);
          setIsHistorical(false);
        }

        let weatherData = cached || [];

        if (!cached) {
          const endDate = new Date(trip.dateRange.end);
          let validEndStr = trip.dateRange.end;
          if (endDate > maxForecastDate) {
            const y = maxForecastDate.getFullYear();
            const m = String(maxForecastDate.getMonth() + 1).padStart(2, "0");
            const d = String(maxForecastDate.getDate()).padStart(2, "0");
            validEndStr = `${y}-${m}-${d}`;
          }

          const params = new URLSearchParams({
            lat: resort.coordinates.lat.toString(),
            lon: resort.coordinates.lon.toString(),
            start: trip.dateRange.start,
            end: validEndStr,
          });

          const weatherRes = await fetch(`/api/weather?${params.toString()}`);
          if (!weatherRes.ok) {
            throw new Error("Failed to fetch weather data");
          }
          weatherData = await weatherRes.json();

          if (mounted) {
            setForecast(weatherData);
            setIsHistorical(false);
            Cache.set(cacheKey, weatherData, 3600);
          }
        }

        if (weatherData.length > 0) {
          const params = new URLSearchParams({
            lat: resort.coordinates.lat.toString(),
            lon: resort.coordinates.lon.toString(),
            start: trip.dateRange.start,
            end: trip.dateRange.end,
          });

          try {
            const historicalRes = await fetch(
              `/api/weather-historical?${params.toString()}`
            );
            if (historicalRes.ok) {
              const historicalData = await historicalRes.json();
              if (mounted) {
                const comparisonResult = compareWeatherData(
                  weatherData,
                  historicalData,
                  trip.dateRange.start
                );
                setComparison(comparisonResult);
              }
            }
          } catch (compErr) {
            console.error("Failed to fetch comparison data", compErr);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to fetch weather:", err);
          setError("Failed to load weather forecast");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchWeather();

    return () => {
      mounted = false;
    };
  }, [
    resort.id,
    resort.coordinates.lat,
    resort.coordinates.lon,
    trip.dateRange.start,
    trip.dateRange.end,
  ]);

  return { forecast, isHistorical, comparison, isLoading, error };
}
