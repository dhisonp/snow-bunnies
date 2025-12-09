import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type TripConfig } from "@/lib/types/trip";
import { type Resort } from "@/lib/types/resort";
import { type DailyWeather } from "@/lib/types/weather";
import { type DailyCrowd } from "@/lib/types/crowd";
import { type ResortInsights } from "@/lib/types/insights";
import { WeatherForecast } from "./WeatherForecast";
import { WeatherPrediction } from "./WeatherPrediction";
import { CrowdChart } from "./CrowdChart";
import { getResortForecast } from "@/lib/services/open-meteo";
import { getExpandedInsight, saveExpandedInsight } from "@/lib/storage";
import {
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Lightbulb,
  CalendarPlus,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

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

function formatDateForICS(dateStr: string, addDays = 0): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (addDays) {
    date.setDate(date.getDate() + addDays);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
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
  const [isHistorical, setIsHistorical] = useState(false);

  const [crowdData, setCrowdData] = useState<DailyCrowd[]>([]);
  const [crowdLoading, setCrowdLoading] = useState(false);

  const [insights, setInsights] = useState<ResortInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandError, setExpandError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchWeatherAndCrowd() {
      try {
        setIsLoading(true);
        setError(null);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const maxForecastDate = new Date(today);
        maxForecastDate.setDate(today.getDate() + 15); // 16 days total (0-15)

        const startDate = new Date(trip.dateRange.start);
        startDate.setHours(0, 0, 0, 0);

        if (startDate > maxForecastDate) {
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
              }
            }
          } catch (e) {
            console.error("Failed to fetch historical weather", e);
          }
          if (mounted) setIsLoading(false);
          return;
        }

        // Clamp the end date to the max forecast date
        const endDate = new Date(trip.dateRange.end);
        let validEndStr = trip.dateRange.end;
        if (endDate > maxForecastDate) {
          const y = maxForecastDate.getFullYear();
          const m = String(maxForecastDate.getMonth() + 1).padStart(2, "0");
          const d = String(maxForecastDate.getDate()).padStart(2, "0");
          validEndStr = `${y}-${m}-${d}`;
        }

        const weatherData = await getResortForecast(
          resort.coordinates.lat,
          resort.coordinates.lon,
          trip.dateRange.start,
          validEndStr
        );

        if (!mounted) return;
        setForecast(weatherData); // Live forecast
        setIsHistorical(false);

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

  const handleExpandInsight = async () => {
    try {
      setIsExpanding(true);
      setExpandError(null);

      const cached = getExpandedInsight(trip.id, resort.id);
      if (cached) {
        setExpandedInsight(cached);
        setIsExpanding(false);
        return;
      }

      const res = await fetch("/api/insights/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resortId: resort.id, tripConfig: trip }),
      });

      if (!res.ok) throw new Error("Failed to expand insights");

      const data = await res.json();
      saveExpandedInsight(trip.id, resort.id, data.insight);
      setExpandedInsight(data.insight);
    } catch (e) {
      console.error(e);
      setExpandError("Failed to generate deep dive.");
    } finally {
      setIsExpanding(false);
    }
  };

  const handleAddToCalendar = () => {
    const start = formatDateForICS(trip.dateRange.start);
    const end = formatDateForICS(trip.dateRange.end, 1);

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:Ski Trip to ${resort.name}`,
      `DESCRIPTION:Skiing at ${resort.name} in ${resort.region}, ${resort.state}.`,
      `LOCATION:${resort.name}, ${resort.state}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; // Use the blob URL object
    link.setAttribute("download", "ski-trip.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const isGlobalLoading = isLoading || crowdLoading || insightsLoading;

  return (
    <Card className="relative min-h-[600px] overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">{resort.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {resort.region}, {resort.state}
          </div>
          <div className="text-sm font-medium mt-1">
            {trip.dateRange.start} - {trip.dateRange.end}
          </div>
          <div className="text-sm font-bold capitalize">
            {trip.userProfile.skillLevel} {trip.userProfile.discipline}
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddToCalendar}
            title="Add to Apple Calendar"
          >
            <CalendarPlus className="h-4 w-4" />
          </Button>
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
      <CardContent className="flex flex-col gap-3 pb-6 flex-1">
        <div>
          {error ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : forecast.length > 0 ? (
            isHistorical ? (
              <WeatherPrediction forecast={forecast} isHistorical={true} />
            ) : (
              <WeatherForecast forecast={forecast} />
            )
          ) : (
            <WeatherPrediction />
          )}
        </div>

        {forecast.length > 0 && !error && (
          <div className="border-2 border-primary rounded-none p-3 bg-muted">
            <div className="text-sm font-bold uppercase mb-1 font-mono tracking-tight">
              Snow Forecast
            </div>
            <p className="text-sm font-medium">{getSnowSummary(forecast)}</p>
          </div>
        )}

        <div>
          {firstDayCrowd ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  Crowd Forecast
                  {firstDayCrowd.holidayName && (
                    <span className="text-sm font-bold ml-2">
                      ({firstDayCrowd.holidayName})
                    </span>
                  )}
                </div>
                <div
                  className={`text-sm font-bold px-2 py-0.5 rounded-none border-2 border-black text-white ${getCrowdColorClass(firstDayCrowd.overallLevel)}`}
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

        {insightsError ? (
          <div className="border-2 border-red-500 bg-red-500/10 p-3 rounded-none flex items-center gap-2 text-red-600 mt-auto">
            <AlertCircle className="h-5 w-5" />
            <span className="font-bold text-sm uppercase">
              Insight Check Failed
            </span>
          </div>
        ) : insights && insights.localTips.length > 0 ? (
          <div className="border-2 border-primary p-0 rounded-none bg-muted mt-auto">
            <div className="flex items-center justify-between p-3 border-b-2 border-primary bg-background">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" strokeWidth={2.5} />
                <span className="font-mono font-bold text-sm uppercase tracking-tight">
                  AI Resort Insights
                </span>
              </div>
            </div>
            <ul className="divide-y-2 divide-primary">
              {insights.localTips.slice(0, 3).map((tip, i) => (
                <li
                  key={i}
                  className="p-3 text-sm font-medium flex gap-3 leading-snug"
                >
                  <span className="font-mono font-bold text-primary shrink-0">
                    {i + 1}.
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <div className="p-2 border-t-2 border-primary bg-background">
              <Button
                variant="default"
                size="sm"
                className="w-full rounded-none font-bold uppercase tracking-wide gap-2 text-xs h-8"
                onClick={handleExpandInsight}
                disabled={isExpanding}
              >
                {isExpanding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {isExpanding ? "Analyzing..." : "Get Local's Deep Dive"}
              </Button>
              {expandError && (
                <p className="text-[10px] text-destructive font-mono mt-1 text-center font-bold">
                  {expandError}
                </p>
              )}
            </div>
          </div>
        ) : null}

        <Dialog
          open={!!expandedInsight}
          onOpenChange={(open) => !open && setExpandedInsight(null)}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-none border-4 border-primary">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-tight text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Variable Conditions Report
              </DialogTitle>
              <DialogDescription className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Generated exclusively for {trip.userProfile.skillLevel}{" "}
                {trip.userProfile.discipline}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 prose prose-sm prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown>{expandedInsight || ""}</ReactMarkdown>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>

      {isGlobalLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white backdrop-blur-sm transition-all duration-200">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-1 mt-4">
            <p className="font-mono text-lg font-bold uppercase tracking-widest">
              Planning Trip
            </p>
            <p className="text-xs text-muted-foreground font-mono uppercase">
              Fetching weather & intel...
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
