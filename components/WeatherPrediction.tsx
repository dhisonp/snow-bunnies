import { Card } from "@/components/ui/card";
import { CloudRain, Snowflake, Sun, CloudSnow } from "lucide-react";

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
        <div className="flex items-center gap-2 mb-4 justify-center text-muted-foreground">
          <div className="flex gap-1">
            <Snowflake className="h-5 w-5" />
            <Sun className="h-5 w-5" />
          </div>
          <span className="font-mono font-bold text-sm uppercase tracking-tight">
            5-Year Historical Average
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {forecast.map((day) => (
            <div
              key={day.date}
              className="flex flex-col items-center p-2 border rounded bg-background/50 space-y-2 py-3"
            >
              <div className="text-xs font-semibold uppercase tracking-wide">
                {new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                })}
              </div>

              <div className="flex justify-center">
                {day.weatherCode > 50 ? (
                  <CloudSnow
                    className="h-8 w-8 text-blue-600"
                    strokeWidth={2}
                  />
                ) : day.precipitationProbability > 40 ? (
                  <CloudRain
                    className="h-8 w-8 text-blue-400"
                    strokeWidth={2}
                  />
                ) : (
                  <Sun className="h-8 w-8 text-orange-500" strokeWidth={2} />
                )}
              </div>

              <div className="text-sm font-bold">
                {formatTemp(day.tempMin)}° / {formatTemp(day.tempMax)}°
              </div>

              <div className="w-full space-y-1 pt-1 border-t border-dashed">
                <div
                  className="flex items-center justify-between text-xs text-muted-foreground"
                  title="Wind"
                >
                  <div className="flex items-center">
                    <span className="font-mono">WIND</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {Math.round(day.windSpeedMax)}kph
                  </span>
                </div>
                <div
                  className="flex items-center justify-between text-xs text-muted-foreground"
                  title="Snow Chance"
                >
                  <span className="font-mono">RISK</span>
                  <span className="font-medium text-blue-600">
                    {day.precipitationProbability}%
                  </span>
                </div>
                <div
                  className="flex items-center justify-between text-xs text-muted-foreground"
                  title="Snow Amount"
                >
                  <span className="font-mono">SNOW</span>
                  <span className="font-bold text-foreground">
                    {day.snowfallSum > 0 ? `${day.snowfallSum}cm` : "-"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-center text-muted-foreground mt-auto pt-3 uppercase tracking-widest opacity-70">
          *Averaged from 2020-2024
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
