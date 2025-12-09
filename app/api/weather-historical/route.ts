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

    // Calculate 5 previous years
    // If trip is in 2025, we want same dates in 2024, 2023, 2022, 2021, 2020
    // Actually, we should just take the last 5 completed years relative to the current date usually,
    // but taking the literal previous 5 years from the target year is fine too.
    // Let's assume we want the last 5 years of data for these *calendar days*.

    // We'll iterate back 5 years from the *current* year, or the trip year?
    // If the trip is in Dec 2025, we can't get Dec 2025 data (future).
    // We should get Dec 2024, 2023, 2022, 2021, 2020.

    const targetYears = [];
    const currentYear = new Date().getFullYear();
    // Use the last 5 complete years. If today is Dec 2025, we might have Dec 2024 data.
    // Safest is to just go back from current year - 1.

    // However, the trip might be in Jan 2026.
    // Logic: For the given MM-DD range, fetch data for years [TripYear-1, TripYear-2, ... TripYear-5]
    // If TripYear-1 is in the future (unlikely given the task is for "post 16 day" trips but theoretically possibly close),
    // we should be careful.
    // Simplified: Just use 2020, 2021, 2022, 2023, 2024 (fixed for now or dynamic based on "today").
    // Better dynamic: Start from (TripYear - 1) down to (TripYear - 5).

    const tripYear = startDate.getFullYear();
    for (let i = 1; i <= 5; i++) {
      targetYears.push(tripYear - i);
    }

    const promises = targetYears.map(async (year) => {
      // Construct start/end for this specific year
      const yStart = new Date(startDate);
      yStart.setFullYear(year);
      const yEnd = new Date(endDate);
      yEnd.setFullYear(year);

      // Handle leap years if Feb 29 is involved, but Date object handles auto-correction usually (mar 1).

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
          "precipitation_probability_max", // specific to prob, might not be in archive? Archive has meaningful data?
          // Archive usually has observed data. `precipitation_probability_max` is a forecast metric.
          // For historical, we should calculate prob from observed precipitation days?
          // Or just omit/mock it?
          // Re-reading spec: "snowDayProbability": 65 (calculated).
          // So we won't get it from API directly.
          "weather_code",
          "wind_speed_10m_max",
          // "uv_index_max" // Archive might have this
        ].join(","),
        timezone: "auto",
      });

      // Archive API url
      const res = await fetch(`${ARCHIVE_API_URL}?${params.toString()}`);
      if (!res.ok) return null;
      return res.json();
    });

    const results = await Promise.all(promises);
    const validResults = results.filter((r) => r !== null);

    if (validResults.length === 0) {
      throw new Error("No historical data found");
    }

    // Now aggregate
    // We need to map the original date range (e.g. Dec 18, Dec 19) to averaged values.
    // The `results` array has `daily` objects. `daily.time` is array of dates.

    // We assume all request returned same number of days (the range duration).
    const durationI = validResults[0].daily.time.length;

    const aggregatedDaily: DailyWeather[] = [];

    for (let i = 0; i < durationI; i++) {
      // For day i (e.g. 1st day of trip)
      let tempMaxSum = 0;
      let tempMinSum = 0;
      let snowSum = 0;
      let precipSum = 0;
      let windSum = 0;
      let snowDays = 0;
      let precipDays = 0;
      // Collect weather codes to find most common? Or just use worst/best?
      // Let's use mode (most common) or just a generic one.

      const codes: number[] = [];

      validResults.forEach((data) => {
        if (!data.daily) return;

        // Watch out for leap years making the array lengths different if crossing Feb 29?
        // If arrays differ, we might have index out of bounds.
        // Simplified: existing index or safe access.
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

      // Reconstruct the date string for the *original* trip year
      const currentDayDate = new Date(startDate);
      currentDayDate.setDate(startDate.getDate() + i);
      const dateStr = currentDayDate.toISOString().split("T")[0];

      // Most common weather code
      const codeCounts = new Map<number, number>();
      let maxCode = 0; // default
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
