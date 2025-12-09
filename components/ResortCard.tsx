import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type TripConfig } from "@/lib/types/trip";
import { type Resort } from "@/lib/types/resort";
import { type DailyWeather } from "@/lib/types/weather";
import { type DailyCrowd } from "@/lib/types/crowd";
import { type ResortInsights } from "@/lib/types/insights";
import { WeatherForecast } from "./WeatherForecast";
import { CrowdChart } from "./CrowdChart";
import { getResortForecast } from "@/lib/services/open-meteo";
import { Pencil, Trash2, Loader2, AlertCircle, Lightbulb } from "lucide-react";

interface ResortCardProps {
  trip: TripConfig;
  resort: Resort;
  onEdit: () => void;
  onDelete: () => void;
}

function getCrowdLabel(level: number): string {
  switch (level) {
    case 1:
      return "Very Light";
    case 2:
      return "Light";
    case 3:
      return "Moderate";
    case 4:
      return "Busy";
    case 5:
      return "Very Busy";
    default:
      return "Unknown";
  }
}

function getCrowdColorClass(level: number): string {
  switch (level) {
    case 1:
      return "bg-green-500";
    case 2:
      return "bg-lime-500";
    case 3:
      return "bg-yellow-500";
    case 4:
      return "bg-orange-500";
    case 5:
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function getSnowSummary(forecast: DailyWeather[]): string {
  if (forecast.length === 0) return "";

  const totalSnow = forecast.reduce((sum, day) => sum + day.snowfallSum, 0);

  if (totalSnow === 0) {
    return "No significant snowfall expected during your trip.";
  }

  const avgSnow = totalSnow / forecast.length;
  if (avgSnow > 10) {
    return `Heavy snowfall expected: ${totalSnow.toFixed(0)}cm total over ${forecast.length} days.`;
  }
  if (avgSnow > 5) {
    return `Moderate snowfall expected: ${totalSnow.toFixed(0)}cm total over ${forecast.length} days.`;
  }
  return `Light snowfall expected: ${totalSnow.toFixed(0)}cm total over ${forecast.length} days.`;
}

export function ResortCard({
  trip,
  resort,
  onEdit,
  onDelete,
}: ResortCardProps) {
  const [forecast, setForecast] = useState<DailyWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [crowdData, setCrowdData] = useState<DailyCrowd[]>([]);
  const [crowdLoading, setCrowdLoading] = useState(false);

  const [insights, setInsights] = useState<ResortInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchWeatherAndCrowd() {
      try {
        setIsLoading(true);
        setError(null);

        const weatherData = await getResortForecast(
          resort.coordinates.lat,
          resort.coordinates.lon,
          trip.dateRange.start,
          trip.dateRange.end
        );

        if (!mounted) return;
        setForecast(weatherData);

        setCrowdLoading(true);
        try {
          const dates = weatherData.map((d) => d.date);
          const crowdResponse = await fetch("/api/crowd", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dates, weatherData }),
          });

          if (crowdResponse.ok && mounted) {
            const crowdResult = await crowdResponse.json();
            setCrowdData(crowdResult.crowds);
          }
        } catch (crowdErr) {
          console.error("Failed to fetch crowd data:", crowdErr);
        } finally {
          if (mounted) setCrowdLoading(false);
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

    fetchWeatherAndCrowd();

    return () => {
      mounted = false;
    };
  }, [
    resort.coordinates.lat,
    resort.coordinates.lon,
    trip.dateRange.start,
    trip.dateRange.end,
  ]);

  useEffect(() => {
    let mounted = true;

    async function fetchInsights() {
      try {
        setInsightsLoading(true);
        setInsightsError(null);

        const response = await fetch("/api/insights/resort", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resortId: resort.id }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch insights");
        }

        const data = await response.json();
        if (mounted) {
          setInsights(data);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to fetch insights:", err);
          setInsightsError("Failed to load insights");
        }
      } finally {
        if (mounted) {
          setInsightsLoading(false);
        }
      }
    }

    fetchInsights();

    return () => {
      mounted = false;
    };
  }, [resort.id]);

  const firstDayCrowd = crowdData[0];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">{resort.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {resort.region}, {resort.state}
          </div>
          <div className="text-sm font-medium mt-1">
            {trip.dateRange.start} - {trip.dateRange.end}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {trip.userProfile.skillLevel} {trip.userProfile.discipline}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="min-h-[200px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Loading forecast...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <WeatherForecast forecast={forecast} />
          )}
        </div>

        {forecast.length > 0 && (
          <div className="border rounded-md p-3 bg-muted/20">
            <div className="text-sm font-medium mb-1">Snow Forecast</div>
            <p className="text-xs text-muted-foreground">
              {getSnowSummary(forecast)}
            </p>
          </div>
        )}

        <div>
          {crowdLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : firstDayCrowd ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  Crowd Forecast
                  {firstDayCrowd.holidayName && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({firstDayCrowd.holidayName})
                    </span>
                  )}
                </div>
                <div
                  className={`text-xs px-2 py-0.5 rounded-full text-white ${getCrowdColorClass(firstDayCrowd.overallLevel)}`}
                >
                  {getCrowdLabel(firstDayCrowd.overallLevel)}
                </div>
              </div>
              <CrowdChart
                data={firstDayCrowd.hourlyBreakdown}
                peakHours={firstDayCrowd.peakHours}
                bestArrivalTime={firstDayCrowd.bestArrivalTime}
              />
            </>
          ) : null}
        </div>

        {insightsLoading ? (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium text-sm">Loading insights...</span>
            </div>
          </div>
        ) : insightsError ? (
          <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-sm text-red-600">
                Could not load insights
              </span>
            </div>
          </div>
        ) : insights && insights.localTips.length > 0 ? (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb
                className="h-5 w-5 text-yellow-600"
                strokeWidth={2.5}
                strokeLinecap="square"
              />
              <span className="font-medium text-sm">Resort Insights</span>
            </div>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              {insights.localTips.slice(0, 3).map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
