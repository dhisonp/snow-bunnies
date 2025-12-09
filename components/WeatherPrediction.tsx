import { Card } from "@/components/ui/card";
import { CloudRain, Snowflake, Sun } from "lucide-react";

import { type DailyWeather } from "@/lib/types/weather";
import { useTemperature } from "@/components/TemperatureContext";

interface WeatherPredictionProps {
  forecast?: DailyWeather[];
  isHistorical?: boolean;
}

export function WeatherPrediction({
  forecast,
  isHistorical,
}: WeatherPredictionProps) {
  const { unit } = useTemperature();

  const formatTemp = (temp: number) => {
    if (unit === "fahrenheit") {
      return Math.round((temp * 9) / 5 + 32);
    }
    return Math.round(temp);
  };

  if (isHistorical && forecast && forecast.length > 0) {
    return (
      <Card className="border-2 border-primary border-dashed bg-muted/50 rounded-none h-full flex flex-col p-4">
        <div className="flex items-center gap-2 mb-3 justify-center text-muted-foreground">
          <div className="flex gap-1">
            <Snowflake className="h-5 w-5" />
            <Sun className="h-5 w-5" />
          </div>
          <span className="font-mono font-bold text-sm uppercase tracking-tight">
            5-Year Historical Average
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {forecast.map((day) => (
            <div
              key={day.date}
              className="text-center p-1 border rounded bg-background/50"
            >
              <div className="text-xs font-semibold mb-1">
                {new Date(day.date).toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                })}
              </div>
              <div className="text-xs font-bold mb-1">
                {formatTemp(day.tempMin)}° / {formatTemp(day.tempMax)}°
              </div>
              <div className="text-xs text-blue-600 font-bold">
                {day.snowfallSum > 0 ? `${day.snowfallSum}cm` : "-"}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-3 italic">
          *Based on observed weather from the past 5 years.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary border-dashed bg-muted/50 rounded-none h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="flex gap-4 mb-4 text-muted-foreground/50">
        <Snowflake className="h-8 w-8" />
        <Sun className="h-8 w-8" />
        <CloudRain className="h-8 w-8" />
      </div>
      <h3 className="font-mono font-bold text-lg uppercase tracking-tight mb-2">
        Long Range Forecast
      </h3>
      <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
        This trip is too far in the future for live weather data. Check back
        closer to your trip date for real-time forecasts.
      </p>
    </Card>
  );
}
