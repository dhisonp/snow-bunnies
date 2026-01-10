"use client";
import type { SpyDayData } from "@/lib/types/spy";
import { Wind, Droplets, Snowflake, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUnits } from "@/components/TemperatureContext";

interface SpyDayCardProps {
  data: SpyDayData;
}

export function SpyDayCard({ data }: SpyDayCardProps) {
  const {
    formatTemp,
    formatWind,
    formatSnow,
    formatPrecip,
    windUnit,
    snowUnit,
    precipUnit,
  } = useUnits();
  const date = new Date(data.date);
  const dateString = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      className="overflow-hidden border-l-4 h-full"
      style={{
        borderLeftColor: getRidabilityColorHex(data.ridability.score),
      }}
    >
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-accent/20">
        <div>
          <CardTitle className="text-base font-bold">{dateString}</CardTitle>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {data.weather.weatherCode}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <Badge
            variant="outline"
            className={cn(
              "font-bold",
              getRidabilityBadgeColor(data.ridability.score)
            )}
          >
            {data.ridability.score} • {data.ridability.label}
          </Badge>
          <span className="text-xs font-mono mt-1">
            {formatTemp(data.weather.tempMin)}° /{" "}
            {formatTemp(data.weather.tempMax)}°
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3 space-y-3 flex-1">
        {/* Weather Metrics */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-1.5" title="New Snow">
            <Snowflake className="h-4 w-4 text-blue-400" />
            <span>
              {formatSnow(data.weather.snowfallSum)}
              {snowUnit}
            </span>
          </div>
          <div className="flex items-center gap-1.5" title="Precipitation">
            <Droplets className="h-4 w-4 text-indigo-400" />
            <span>
              {formatPrecip(data.weather.precipitationSum)}
              {precipUnit}
            </span>
          </div>
          <div className="flex items-center gap-1.5" title="Wind">
            <Wind className="h-4 w-4 text-gray-400" />
            <span>
              {formatWind(data.weather.windSpeedMax)}
              {windUnit}
            </span>
          </div>
        </div>

        {/* Best Window */}
        {data.bestWindow && (
          <div className="bg-secondary/50 rounded-md p-2 flex gap-3 items-start">
            <Clock className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
            <div>
              <div className="text-sm font-semibold">
                {data.bestWindow.window}
              </div>
              <div className="text-xs text-muted-foreground">
                {data.bestWindow.note}
              </div>
            </div>
          </div>
        )}

        {/* Reasons / Notes */}
        <div className="space-y-1">
          {data.ridability.reasons.map((reason, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
          {data.notes?.map((note, idx) => (
            <div
              key={`note-${idx}`}
              className="flex items-center gap-2 text-xs text-amber-600 font-medium"
            >
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getRidabilityColorHex(score: number) {
  if (score >= 90) return "#a855f7"; // purple-500
  if (score >= 80) return "#22c55e"; // green-500
  if (score >= 60) return "#34d399"; // emerald-400
  if (score >= 40) return "#facc15"; // yellow-400
  return "#f87171"; // red-400
}

function getRidabilityBadgeColor(score: number) {
  if (score >= 90) return "border-purple-500 text-purple-700 bg-purple-50";
  if (score >= 80) return "border-green-500 text-green-700 bg-green-50";
  if (score >= 60) return "border-emerald-400 text-emerald-700 bg-emerald-50";
  if (score >= 40) return "border-yellow-400 text-yellow-700 bg-yellow-50";
  return "border-red-400 text-red-700 bg-red-50";
}
