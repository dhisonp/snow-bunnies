import { Card } from "@/components/ui/card";
import { type DailyWeather } from "@/lib/types/weather";
import { useUnits } from "@/components/TemperatureContext";
import { Sun, CloudSnow, Wind } from "lucide-react";

interface WeatherForecastProps {
  forecast: DailyWeather[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export function WeatherForecast({
  forecast,
  selectedDate,
  onSelectDate,
}: WeatherForecastProps) {
  const { formatTemp, formatWind, formatSnow, windUnit, snowUnit } = useUnits();

  const handleDayClick = (date: string) => {
    if (selectedDate === date) {
      onSelectDate(null);
    } else {
      onSelectDate(date);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-1">
      {forecast.map((day) => {
        const isSelected = selectedDate === day.date;
        return (
          <Card
            key={day.date}
            className={`text-center p-1 cursor-pointer transition-all hover:bg-muted/50 rounded-none border-2 ${
              isSelected
                ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-1"
                : "border-border"
            }`}
            onClick={() => handleDayClick(day.date)}
          >
            <div
              className={`text-sm font-semibold ${isSelected ? "text-primary uppercase tracking-wider" : ""}`}
            >
              {new Date(day.date).toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </div>
            <div className="flex justify-center my-1">
              {day.weatherCode > 50 ? (
                <CloudSnow
                  className={`h-8 w-8 ${isSelected ? "text-primary" : "text-blue-600"}`}
                  strokeWidth={2.5}
                  strokeLinecap="square"
                />
              ) : (
                <Sun
                  className={`h-8 w-8 ${isSelected ? "text-primary" : "text-orange-500"}`}
                  strokeWidth={2.5}
                  strokeLinecap="square"
                />
              )}
            </div>
            <div className="text-sm font-bold">
              {formatTemp(day.tempMin)}° / {formatTemp(day.tempMax)}°
            </div>
            <div
              className={`text-sm font-bold ${
                day.snowfallSum > 0
                  ? isSelected
                    ? "text-primary"
                    : "text-blue-600"
                  : "text-muted-foreground"
              }`}
            >
              {day.snowfallSum > 0
                ? `${formatSnow(day.snowfallSum)}${snowUnit}`
                : "-"}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Wind className="h-3 w-3" strokeWidth={2.5} />
              <span>
                {formatWind(day.windSpeedMax)}
                {windUnit}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
