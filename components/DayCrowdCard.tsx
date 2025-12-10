import { type DailyCrowd } from "@/lib/types/crowd";
import { type DailyWeather } from "@/lib/types/weather";
import { CrowdChart } from "./CrowdChart";
import { Snowflake, Info } from "lucide-react";

interface DayCrowdCardProps {
  crowd: DailyCrowd;
  weather?: DailyWeather;
  titleOverride?: string;
}

function getCrowdBg(level: number): string {
  switch (level) {
    case 1:
      return "bg-crowd-1 border-crowd-1";
    case 2:
      return "bg-crowd-2 border-crowd-2";
    case 3:
      return "bg-crowd-3 border-crowd-3";
    case 4:
      return "bg-crowd-4 border-crowd-4";
    case 5:
      return "bg-crowd-5 border-crowd-5";
    default:
      return "bg-muted border-muted";
  }
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

export function DayCrowdCard({
  crowd,
  weather,
  titleOverride,
}: DayCrowdCardProps) {
  const isPowderDay = weather && weather.snowfallSum > 15;

  return (
    <div className="border-2 border-primary bg-background mb-[-2px] relative z-0">
      <div className="w-full flex flex-col p-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="font-mono font-bold uppercase text-lg w-16 leading-tight">
              {titleOverride
                ? titleOverride
                    .split(" ")
                    .map((part, i) => <div key={i}>{part}</div>)
                : getDayName(crowd.date)
                    .split(" ")
                    .map((part, i) => <div key={i}>{part}</div>)}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold text-sm px-2 py-0.5 border-2 text-foreground ${getCrowdBg(crowd.overallLevel)}`}
                >
                  Lvl {crowd.overallLevel}
                </span>
                {crowd.holidayName && (
                  <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1 border border-primary/20">
                    {crowd.holidayName}
                  </span>
                )}
              </div>

              {weather && (
                <div className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-2">
                  <span>
                    {Math.round(weather.tempMin)}° /{" "}
                    {Math.round(weather.tempMax)}°
                  </span>
                  {weather.snowfallSum > 0 && (
                    <span className="flex items-center text-blue-600 font-bold">
                      <Snowflake className="h-3 w-3 mr-0.5" />
                      {weather.snowfallSum}cm
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t-2 border-primary bg-muted/30">
        <div className="bg-background border-2 border-primary p-3 mb-3 relative">
          <div className="absolute -top-2.5 left-2 bg-background px-1 text-[10px] font-mono font-bold uppercase border border-primary">
            Hourly Details
          </div>
          <CrowdChart
            data={crowd.hourlyBreakdown}
            peakHours={crowd.peakHours}
            bestArrivalTime={crowd.bestArrivalTime}
          />
        </div>

        {isPowderDay && (
          <div className="flex items-start gap-2 text-sm p-3 bg-blue-50 border-2 border-blue-200 text-blue-800">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="font-medium leading-tight">
              Big powder expected! Crowds may be higher than usual as locals
              flock to the mountain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
