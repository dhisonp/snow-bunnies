"use client";
import type { SpyDayData } from "@/lib/types/spy";
import { Cloud, CloudRain, CloudSnow, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnits } from "@/components/TemperatureContext";

interface SpyOverviewRowProps {
  data: SpyDayData[];
  onDayClick?: (date: string) => void;
}

function getWeatherIcon(code: number) {
  // WMO codes
  if (code >= 71) return <CloudSnow className="h-4 w-4 text-blue-400" />;
  if (code >= 51) return <CloudRain className="h-4 w-4 text-indigo-400" />;
  if (code >= 1) return <Cloud className="h-4 w-4 text-gray-400" />;
  return <Sun className="h-4 w-4 text-amber-400" />;
}

function getRidabilityColor(score: number) {
  if (score >= 90) return "bg-purple-500"; // Prime
  if (score >= 80) return "bg-green-500"; // Great
  if (score >= 60) return "bg-emerald-400"; // Good
  if (score >= 40) return "bg-yellow-400"; // Fair
  return "bg-red-400"; // Poor
}

export function SpyOverviewRow({ data, onDayClick }: SpyOverviewRowProps) {
  const { formatTemp } = useUnits();
  return (
    <div className="flex overflow-x-auto gap-2 p-4 pb-2 scrollbar-hide">
      {data.map((day) => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        return (
          <div
            key={day.date}
            className="flex flex-col items-center gap-1 min-w-[50px] p-2 rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:bg-accent"
            onClick={() => onDayClick?.(day.date)}
          >
            <span className="text-xs font-medium text-muted-foreground">
              {dayName}
            </span>
            {getWeatherIcon(day.weather.weatherCode)}
            <div className="text-xs font-bold">
              {formatTemp(day.weather.tempMax)}°
            </div>
            <div
              className={cn(
                "h-1.5 w-full rounded-full mt-1",
                getRidabilityColor(day.ridability.score)
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
