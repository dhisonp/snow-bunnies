import { Card } from "@/components/ui/card";
import { CloudRain, Snowflake, Sun, CloudSnow } from "lucide-react";

import { type DailyWeather } from "@/lib/types/weather";
import { useUnits } from "@/components/TemperatureContext";

interface WeatherPredictionProps {
  forecast?: DailyWeather[];
  isHistorical?: boolean;
}

export function WeatherPrediction({
  forecast,
  isHistorical,
}: WeatherPredictionProps) {
  const { formatTemp, formatSnow, snowUnit } = useUnits();

  if (isHistorical && forecast && forecast.length > 0) {
    return (
      <div>
        <div className="grid grid-cols-4 gap-1">
          {forecast.map((day) => (
            <Card
              key={day.date}
              className="text-center p-1 border-dashed opacity-90"
            >
              <div className="text-sm font-semibold">
                {new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </div>
              <div className="flex justify-center my-1">
                {day.weatherCode > 50 ? (
                  <CloudSnow
                    className="h-8 w-8 text-blue-600"
                    strokeWidth={2.5}
                    strokeLinecap="square"
                  />
                ) : (
                  <Sun
                    className="h-8 w-8 text-orange-500"
                    strokeWidth={2.5}
                    strokeLinecap="square"
                  />
                )}
              </div>
              <div className="text-sm font-bold">
                {formatTemp(day.tempMin)}° / {formatTemp(day.tempMax)}°
              </div>
              <div className="text-sm text-blue-600 font-bold">
                {day.snowfallSum > 0
                  ? `${formatSnow(day.snowfallSum)}${snowUnit}`
                  : "-"}
              </div>
            </Card>
          ))}
        </div>
      </div>
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
