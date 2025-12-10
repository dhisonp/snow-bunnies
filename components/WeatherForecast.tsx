import { Card } from "@/components/ui/card";
import { type DailyWeather } from "@/lib/types/weather";
import { useUnits } from "@/components/TemperatureContext";
import { SectionHeader } from "./SectionHeader";
import { Wind } from "lucide-react";
import { WeatherIcon } from "./WeatherIcon";

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
    <div className="relative group">
      <SectionHeader>Click day for details</SectionHeader>
      <div className="grid grid-cols-4 gap-1 relative group">
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
                <WeatherIcon
                  code={day.weatherCode}
                  className={`h-8 w-8 ${isSelected ? "text-primary" : ""}`}
                  strokeWidth={2.5}
                />
              </div>
              <div className="text-sm font-bold tabular-nums">
                {formatTemp(day.tempMin)}° / {formatTemp(day.tempMax)}°
              </div>
              <div
                className={`text-sm font-bold tabular-nums ${
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
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground tabular-nums">
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
    </div>
  );
}
