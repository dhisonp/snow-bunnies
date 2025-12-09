import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyWeather } from "@/lib/types/weather";
import { useTemperature } from "@/components/TemperatureContext";

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

  return (
    <div className="grid grid-cols-4 gap-2">
      {forecast.map((day) => (
        <Card key={day.date} className="text-center p-2">
          <div className="text-sm font-semibold">
            {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
          </div>
          <div className="text-2xl my-1">
            {day.weatherCode > 50 ? "🌨️" : "☀️"}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatTemp(day.tempMin)}° / {formatTemp(day.tempMax)}°
          </div>
          <div className="text-xs text-blue-500 font-medium">
            {day.snowfallSum > 0 ? `${day.snowfallSum}cm` : "-"}
          </div>
        </Card>
      ))}
    </div>
  );
}
