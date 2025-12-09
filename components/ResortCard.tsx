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
import {
  getExpandedInsight,
  saveExpandedInsight,
  getTripBrief,
  saveTripBrief,
} from "@/lib/storage";
import { type TripBrief } from "@/lib/types/insights";
import { useUnits } from "@/components/TemperatureContext";
import {
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Lightbulb,
  CalendarPlus,
  Sparkles,
  Zap,
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

function getSnowSummary(
  forecast: DailyWeather[],
  formatSnow: (cm: number) => number,
  snowUnit: string
): string {
  if (forecast.length === 0) return "";

  const totalSnow = forecast.reduce((sum, day) => sum + day.snowfallSum, 0);

  if (totalSnow === 0) {
    return "No significant snowfall expected during your trip.";
  }

  const formattedTotal = formatSnow(totalSnow);
  const avgSnow = totalSnow / forecast.length;
  if (avgSnow > 10) {
    return `Heavy snowfall expected: ${formattedTotal}${snowUnit} total over ${forecast.length} days.`;
  }
  if (avgSnow > 5) {
    return `Moderate snowfall expected: ${formattedTotal}${snowUnit} total over ${forecast.length} days.`;
  }
  return `Light snowfall expected: ${formattedTotal}${snowUnit} total over ${forecast.length} days.`;
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
  const { formatSnow, snowUnit } = useUnits();

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
  const [showCommunityInsights, setShowCommunityInsights] = useState(false);

  const [tripBrief, setTripBrief] = useState<TripBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [showBrief, setShowBrief] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);

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

  const handleGetTripBrief = async () => {
    if (isHistorical) {
      setShowPredictionModal(true);
      return;
    }

    try {
      setBriefLoading(true);
      setBriefError(null);

      const cached = getTripBrief(trip.id, resort.id);
      if (cached) {
        setTripBrief(cached);
        setShowBrief(true);
        setBriefLoading(false);
        return;
      }

      const res = await fetch("/api/insights/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripConfig: trip,
          weatherData: forecast,
          crowdData: crowdData,
          resortInsights: insights,
          historicalComparison: [], // Pass empty if not available
        }),
      });

      if (!res.ok) throw new Error("Failed to generate trip brief");

      const data: TripBrief = await res.json();
      saveTripBrief(trip.id, resort.id, data);
      setTripBrief(data);
      setShowBrief(true);
    } catch (e) {
      console.error(e);
      setBriefError("Failed to generate trip brief.");
    } finally {
      setBriefLoading(false);
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
            <p className="text-sm font-medium">
              {getSnowSummary(forecast, formatSnow, snowUnit)}
            </p>
            {isHistorical && (
              <p className="text-xs font-mono text-muted-foreground mt-2">
                These are data based on the 5-year historical average.
              </p>
            )}
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
            <div className="p-2 bg-background">
              <Button
                variant="ghost"
                size="sm"
                className="w-full rounded-none font-bold uppercase tracking-wide gap-2 text-xs h-8 border-2"
                onClick={() => setShowCommunityInsights(true)}
              >
                <Lightbulb className="h-3.5 w-3.5" />
                View All Insights
              </Button>
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
            <div className="p-2 border-t-2 border-primary bg-background grid grid-cols-1 gap-2">
              {/* <Button
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
              </Button> */}

              <Button
                variant="default"
                size="sm"
                className="w-full rounded-none font-bold uppercase tracking-wide gap-2 text-xs h-8"
                onClick={handleGetTripBrief}
                disabled={briefLoading}
              >
                {briefLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5 fill-current" />
                )}
                {briefLoading ? "Generating..." : "Get Trip Brief"}
              </Button>
              {briefError && (
                <p className="text-[10px] text-destructive font-mono mt-1 text-center font-bold">
                  {briefError}
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

        <Dialog
          open={showCommunityInsights}
          onOpenChange={setShowCommunityInsights}
        >
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-none border-4 border-primary shadow-[8px_8px_0px_0px_var(--foreground)]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-tight text-xl">
                <Lightbulb className="h-5 w-5 text-primary" />
                Community Insights: {resort.name}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Local knowledge from Reddit & Forums
              </DialogDescription>
            </DialogHeader>
            {insights && (
              <div className="mt-4 space-y-4">
                {/* Overview */}
                <div className="border-2 border-primary rounded-none p-3 bg-muted">
                  <h3 className="font-mono font-bold uppercase text-sm mb-2 tracking-tight">
                    Overview
                  </h3>
                  <p className="text-sm leading-relaxed">{insights.overview}</p>
                </div>

                {/* All Local Tips */}
                <div className="border-2 border-primary rounded-none bg-muted">
                  <h3 className="font-mono font-bold uppercase text-sm p-3 border-b-2 border-primary bg-background tracking-tight">
                    Local Tips
                  </h3>
                  <ul className="divide-y-2 divide-primary">
                    {insights.localTips.map((tip, i) => (
                      <li
                        key={i}
                        className="p-3 text-sm flex gap-3 leading-snug"
                      >
                        <span className="font-mono font-bold text-primary shrink-0">
                          {i + 1}.
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best Runs by Level */}
                <div className="border-2 border-primary rounded-none bg-muted">
                  <h3 className="font-mono font-bold uppercase text-sm p-3 border-b-2 border-primary bg-background tracking-tight">
                    Best Runs by Level
                  </h3>
                  <div className="divide-y-2 divide-primary">
                    {Object.entries(insights.bestRunsByLevel).map(
                      ([level, runs]) => (
                        <div key={level} className="p-3">
                          <h4 className="font-mono font-bold uppercase text-xs mb-2 text-primary tracking-tight">
                            {level}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {runs.map((run, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 border-2 border-primary bg-background font-medium"
                              >
                                {run}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Hidden Gems */}
                <div className="border-2 border-primary rounded-none bg-muted">
                  <h3 className="font-mono font-bold uppercase text-sm p-3 border-b-2 border-primary bg-background tracking-tight">
                    Hidden Gems
                  </h3>
                  <ul className="divide-y-2 divide-primary">
                    {insights.hiddenGems.map((gem, i) => (
                      <li
                        key={i}
                        className="p-3 text-sm flex gap-3 leading-snug"
                      >
                        <span className="font-mono font-bold text-primary shrink-0">
                          •
                        </span>
                        <span>{gem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Avoid List */}
                <div className="border-2 border-primary rounded-none bg-muted">
                  <h3 className="font-mono font-bold uppercase text-sm p-3 border-b-2 border-primary bg-background tracking-tight">
                    What to Avoid
                  </h3>
                  <ul className="divide-y-2 divide-primary">
                    {insights.avoidList.map((item, i) => (
                      <li
                        key={i}
                        className="p-3 text-sm flex gap-3 leading-snug"
                      >
                        <span className="font-mono font-bold text-red-500 shrink-0">
                          ✕
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Food Recommendations */}
                <div className="border-2 border-primary rounded-none bg-muted">
                  <h3 className="font-mono font-bold uppercase text-sm p-3 border-b-2 border-primary bg-background tracking-tight">
                    Food Recommendations
                  </h3>
                  <div className="divide-y-2 divide-primary">
                    <div className="p-3">
                      <h4 className="font-mono font-bold uppercase text-xs mb-2 text-primary tracking-tight">
                        On Mountain
                      </h4>
                      <ul className="space-y-1.5">
                        {insights.foodRecs.onMountain.map((rec, i) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3">
                      <h4 className="font-mono font-bold uppercase text-xs mb-2 text-primary tracking-tight">
                        Base / Nearby
                      </h4>
                      <ul className="space-y-1.5">
                        {insights.foodRecs.base.map((rec, i) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Parking Strategy */}
                <div className="border-2 border-primary rounded-none p-3 bg-muted">
                  <h3 className="font-mono font-bold uppercase text-sm mb-2 tracking-tight">
                    Parking Strategy
                  </h3>
                  <p className="text-sm leading-relaxed">
                    {insights.parkingStrategy}
                  </p>
                </div>

                {/* Crowd Patterns */}
                <div className="border-2 border-primary rounded-none p-3 bg-muted">
                  <h3 className="font-mono font-bold uppercase text-sm mb-2 tracking-tight">
                    Crowd Patterns
                  </h3>
                  <p className="text-sm leading-relaxed">
                    {insights.crowdPatterns}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showBrief} onOpenChange={setShowBrief}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-none border-4 border-primary">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-tight text-xl">
                <Zap className="h-5 w-5 text-primary fill-current" />
                Trip Brief
              </DialogTitle>
              <DialogDescription className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Your personalized action plan
              </DialogDescription>
            </DialogHeader>

            {tripBrief && (
              <div className="mt-4 space-y-6">
                <div className="p-4 bg-muted border-l-4 border-primary">
                  <p className="text-sm font-medium leading-relaxed">
                    {tripBrief.summary}
                  </p>
                </div>

                <div>
                  <h3 className="font-mono font-bold uppercase text-sm mb-3 flex items-center gap-2">
                    <CalendarPlus className="h-4 w-4" />
                    Daily Game Plan
                  </h3>
                  <div className="space-y-4">
                    {tripBrief.dailyGamePlan.map((plan, i) => (
                      <div
                        key={i}
                        className="border-2 border-primary p-3 relative"
                      >
                        <div className="absolute -top-3 left-3 bg-background px-2 text-xs font-mono font-bold border-2 border-primary">
                          {plan.date}
                        </div>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm font-bold">
                            {plan.recommendation}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-primary text-primary-foreground px-2 py-0.5 font-bold">
                              {plan.bestTimeSlot}
                            </span>
                            {plan.targetZones.map((zone, z) => (
                              <span
                                key={z}
                                className="border border-primary px-2 py-0.5"
                              >
                                {zone}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-primary p-3">
                    <h3 className="font-mono font-bold uppercase text-xs mb-2 bg-primary text-primary-foreground inline-block px-1">
                      Gear Check
                    </h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {tripBrief.gearConsiderations.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {tripBrief.warningsAndAlerts.length > 0 && (
                    <div className="border-2 border-red-500 bg-red-500/10 p-3 text-red-600">
                      <h3 className="font-mono font-bold uppercase text-xs mb-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Alerts
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {tripBrief.warningsAndAlerts.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={showPredictionModal}
          onOpenChange={setShowPredictionModal}
        >
          <DialogContent className="max-w-md rounded-none border-4 border-primary bg-background shadow-[8px_8px_0px_0px_var(--foreground)]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-tight text-xl">
                <CalendarPlus className="h-5 w-5 text-primary" />
                Come Back Later
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm leading-relaxed">
                Trip Briefs rely on live weather patterns and crowd tracking to
                give you accurate, actionable advice.
              </p>
              <p className="text-sm font-medium border-l-4 border-primary pl-3 py-1 bg-muted">
                Please return when your trip is within{" "}
                <span className="text-primary font-bold">16 days</span> for a
                full report.
              </p>
              <Button
                onClick={() => setShowPredictionModal(false)}
                className="w-full rounded-none font-bold uppercase"
              >
                Understood
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>

      {isGlobalLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-black backdrop-blur-sm transition-all duration-200">
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
