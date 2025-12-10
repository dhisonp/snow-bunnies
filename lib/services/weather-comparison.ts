import {
  type DailyWeather,
  type ComparisonResult,
  type TripComparison,
} from "@/lib/types/weather";

export function compareWeatherData(
  forecast: DailyWeather[],
  historical: DailyWeather[],
  tripStartDate: string
): TripComparison {
  const dailyComparisons: ComparisonResult[] = [];
  let totalForecastSnow = 0;
  let totalHistoricalSnow = 0;
  let totalTempDiff = 0;
  let maxSnowDate = "";
  let maxSnowAmount = -1;

  // Align dates
  // Assuming forecast and historical arrays are sorted and cover the same date range
  // In a real app, we might need more robust date matching
  const map = new Map<string, DailyWeather>();
  historical.forEach((h) => map.set(h.date.split("T")[0], h));

  forecast.forEach((f) => {
    const dateKey = f.date.split("T")[0];
    const h = map.get(dateKey);

    if (!h) return; // Skip if no matching historical data

    const forecastAvgTemp = (f.tempMin + f.tempMax) / 2;
    // For historical, we assume the provided object is already an average
    const historicalAvgTemp = (h.tempMin + h.tempMax) / 2;

    const snowfallDelta = f.snowfallSum - h.snowfallSum;
    const snowfallPct =
      h.snowfallSum > 0 ? (snowfallDelta / h.snowfallSum) * 100 : 0;
    const tempDelta = forecastAvgTemp - historicalAvgTemp;

    let verdict: ComparisonResult["verdict"] = "average";
    if (snowfallPct > 15) verdict = "above_avg";
    else if (snowfallPct < -15) verdict = "below_avg";

    // Confidence calculation
    const daysUntilTrip = Math.ceil(
      (new Date(tripStartDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // We calculate days from TODAY to the specific forecast date
    const forecastDate = new Date(f.date);
    const today = new Date();
    const daysOut = Math.ceil(
      (forecastDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    let confidence: ComparisonResult["confidence"] = "low";
    if (daysOut <= 7) confidence = "high";
    else if (daysOut <= 14) confidence = "medium";

    const result: ComparisonResult = {
      date: f.date,
      forecast: {
        snowfall: f.snowfallSum,
        tempAvg: forecastAvgTemp,
      },
      historical: {
        snowfall: h.snowfallSum,
        tempAvg: historicalAvgTemp,
        sampleYears: 5, // Hardcoded for now based on API knowledge
      },
      delta: {
        snowfall: snowfallDelta,
        snowfallPct,
        temp: tempDelta,
      },
      verdict,
      confidence,
    };

    dailyComparisons.push(result);

    totalForecastSnow += f.snowfallSum;
    totalHistoricalSnow += h.snowfallSum;
    totalTempDiff += tempDelta;

    if (f.snowfallSum > maxSnowAmount) {
      maxSnowAmount = f.snowfallSum;
      maxSnowDate = f.date;
    }
  });

  // Summary generation
  const avgTempDiff =
    dailyComparisons.length > 0 ? totalTempDiff / dailyComparisons.length : 0;

  const snowDiff = totalForecastSnow - totalHistoricalSnow;
  const snowDiffPct =
    totalHistoricalSnow > 0 ? (snowDiff / totalHistoricalSnow) * 100 : 0;

  let snowfallVerdict = "Typical snowfall";
  if (snowDiffPct > 15)
    snowfallVerdict = `${Math.round(snowDiffPct)}% above average`;
  else if (snowDiffPct < -15)
    snowfallVerdict = `${Math.abs(Math.round(snowDiffPct))}% below average`;

  const tempVerdict =
    Math.abs(avgTempDiff) < 1
      ? "About average temperature"
      : `${Math.abs(avgTempDiff).toFixed(1)}°C ${avgTempDiff > 0 ? "warmer" : "colder"} than usual`;

  const bestDayDate = new Date(maxSnowDate);
  const bestDay = maxSnowDate
    ? `${bestDayDate.toLocaleDateString("en-US", { weekday: "long" })} looks best`
    : "No heavy snow expected";

  const caption = `Your trip dates historically see ${Math.round(totalHistoricalSnow)}cm of snow, but this year's forecast shows ${Math.round(totalForecastSnow)}cm — ${snowfallVerdict.toLowerCase()} conditions. Temperatures will be ${tempVerdict.toLowerCase()}.`;

  return {
    daily: dailyComparisons,
    summary: {
      totalForecastSnow,
      totalHistoricalSnow,
      snowfallVerdict,
      tempVerdict,
      bestDay,
      caption,
    },
  };
}
