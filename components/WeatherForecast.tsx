import { Card } from "@/components/ui/card";
import { type DailyWeather } from "@/lib/types/weather";
import { useTemperature } from "@/components/TemperatureContext";
import { Sun, CloudSnow, Wind } from "lucide-react";

interface WeatherForecastProps {
  forecast: DailyWeather[];
}

export function WeatherForecast({ forecast }: WeatherForecastProps) {
  const { unit } = useTemperature();

  const formatTemp = (temp: number) => {
    if (unit === "fahrenheit") {
      return Math.round((temp * 9) / 5 + 32);
    }
    return Math.round(temp);
  };

  const formatWind = (speed: number) => {
    if (unit === "fahrenheit") {
      return Math.round(speed * 0.621371);
    }
    return Math.round(speed);
  };

  return (
    <div className="grid grid-cols-4 gap-1">
      {forecast.map((day) => (
        <Card key={day.date} className="text-center p-1">
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
            {day.snowfallSum > 0 ? `${day.snowfallSum}cm` : "-"}
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Wind className="h-3 w-3" strokeWidth={2.5} />
            <span>
              {formatWind(day.windSpeedMax)}
              {unit === "fahrenheit" ? "mph" : "km/h"}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
