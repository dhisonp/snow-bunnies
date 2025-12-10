import { AlertCircle } from "lucide-react";
import { type DailyWeather } from "@/lib/types/weather";
import { WeatherForecast } from "@/components/WeatherForecast";
import { WeatherPrediction } from "@/components/WeatherPrediction";
import { useUnits } from "@/components/TemperatureContext";

interface WeatherSectionProps {
  forecast: DailyWeather[];
  isHistorical: boolean;
  error: string | null;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

function getSnowSummary(
  forecast: DailyWeather[],
  formatSnow: (cm: number) => number,
  snowUnit: string
): string {
  if (forecast.length === 0) return "";

  const totalSnow = forecast.reduce((sum, day) => sum + day.snowfallSum, 0);

  if (totalSnow === 0) {
    return "No significant snowfall expected during your trip.";
  }

  const formattedTotal = formatSnow(totalSnow);
  const avgSnow = totalSnow / forecast.length;
  if (avgSnow > 10) {
    return `Heavy snowfall expected: ${formattedTotal}${snowUnit} total over ${forecast.length} days.`;
  }
  if (avgSnow > 5) {
    return `Moderate snowfall expected: ${formattedTotal}${snowUnit} total over ${forecast.length} days.`;
  }
  return `Light snowfall expected: ${formattedTotal}${snowUnit} total over ${forecast.length} days.`;
}

export function WeatherSection({
  forecast,
  isHistorical,
  error,
  selectedDate,
  onSelectDate,
}: WeatherSectionProps) {
  const { formatSnow, snowUnit } = useUnits();

  return (
    <div>
      {error ? (
        <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-destructive">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>{error}</p>
        </div>
      ) : forecast.length > 0 ? (
        isHistorical ? (
          <WeatherPrediction forecast={forecast} isHistorical={true} />
        ) : (
          <WeatherForecast
            forecast={forecast}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        )
      ) : (
        <WeatherPrediction />
      )}

      {forecast.length > 0 && !error && (
        <div className="border-2 border-primary rounded-none p-3 bg-muted mt-3">
          <div className="text-sm font-bold uppercase mb-1 font-mono tracking-tight">
            Snow Forecast
          </div>
          <p className="text-sm font-medium">
            {getSnowSummary(forecast, formatSnow, snowUnit)}
          </p>
          {isHistorical && (
            <p className="text-xs font-mono text-muted-foreground mt-2">
              These are data based on the 5-year historical average.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
