import { NextResponse } from "next/server";
import { type DailyWeather } from "@/lib/types/weather";

const ARCHIVE_API_URL = "https://archive-api.open-meteo.com/v1/archive";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const start = searchParams.get("start"); // "YYYY-MM-DD"
  const end = searchParams.get("end");

  if (!lat || !lon || !start || !end) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const targetYears = [];
    const tripYear = startDate.getFullYear();
    for (let i = 1; i <= 5; i++) {
      targetYears.push(tripYear - i);
    }

    const promises = targetYears.map(async (year) => {
      const yStart = new Date(startDate);
      yStart.setFullYear(year);
      const yEnd = new Date(endDate);
      yEnd.setFullYear(year);

      const s = yStart.toISOString().split("T")[0];
      const e = yEnd.toISOString().split("T")[0];

      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        start_date: s,
        end_date: e,
        daily: [
          "temperature_2m_max",
          "temperature_2m_min",
          "precipitation_sum",
          "snowfall_sum",
          "precipitation_probability_max",
          "weather_code",
          "wind_speed_10m_max",
          // "uv_index_max"
        ].join(","),
        timezone: "auto",
      });

      const res = await fetch(`${ARCHIVE_API_URL}?${params.toString()}`);
      if (!res.ok) return null;
      return res.json();
    });

    const results = await Promise.all(promises);
    const validResults = results.filter((r) => r !== null);

    if (validResults.length === 0) {
      throw new Error("No historical data found");
    }

    // We assume all request returned same number of days (the range duration).
    const durationI = validResults[0].daily.time.length;

    const aggregatedDaily: DailyWeather[] = [];

    for (let i = 0; i < durationI; i++) {
      let tempMaxSum = 0;
      let tempMinSum = 0;
      let snowSum = 0;
      let precipSum = 0;
      let windSum = 0;
      let snowDays = 0;
      let precipDays = 0;
      const codes: number[] = [];

      validResults.forEach((data) => {
        if (!data.daily) return;

        const tMax = data.daily.temperature_2m_max[i] || 0;
        const tMin = data.daily.temperature_2m_min[i] || 0;
        const snow = data.daily.snowfall_sum[i] || 0;
        const precip = data.daily.precipitation_sum[i] || 0;
        const wind = data.daily.wind_speed_10m_max[i] || 0;
        const code = data.daily.weather_code[i];

        tempMaxSum += tMax;
        tempMinSum += tMin;
        snowSum += snow;
        precipSum += precip;
        windSum += wind;

        if (snow > 0) snowDays++;
        if (precip > 0.1) precipDays++;
        if (code !== undefined) codes.push(code);
      });

      const count = validResults.length;

      const currentDayDate = new Date(startDate);
      currentDayDate.setDate(startDate.getDate() + i);
      const dateStr = currentDayDate.toISOString().split("T")[0];

      const codeCounts = new Map<number, number>();
      let maxCode = 0;
      let maxCount = 0;
      codes.forEach((c) => {
        const val = (codeCounts.get(c) || 0) + 1;
        codeCounts.set(c, val);
        if (val > maxCount) {
          maxCount = val;
          maxCode = c;
        }
      });

      aggregatedDaily.push({
        date: dateStr,
        tempMax: Math.round((tempMaxSum / count) * 10) / 10,
        tempMin: Math.round((tempMinSum / count) * 10) / 10,
        snowfallSum: Math.round((snowSum / count) * 10) / 10,
        precipitationSum: Math.round((precipSum / count) * 10) / 10,
        precipitationProbability: Math.round((precipDays / count) * 100),
        weatherCode: maxCode,
        windSpeedMax: Math.round((windSum / count) * 10) / 10,
        uvIndexMax: 0, // Not fetching for now
      });
    }

    return NextResponse.json(aggregatedDaily);
  } catch (error) {
    console.error("Historical weather error:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 500 }
    );
  }
}
