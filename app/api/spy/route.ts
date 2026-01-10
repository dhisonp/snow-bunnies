import { NextResponse } from "next/server";
import { OPEN_METEO_FORECAST_MAX_DAYS } from "@/lib/constants/open-meteo";
import { getResortForecast, getResortHistory } from "@/lib/services/open-meteo";
import { calculateRidability } from "@/lib/services/spy-ridability";
import { calculateBestWindow } from "@/lib/services/spy-windows";
import resortsData from "@/lib/data/resorts.json";
import { type Resort } from "@/lib/types/resort";
import {
  type SpyModeResponse,
  type SpyDayData,
  type RecentWeather,
} from "@/lib/types/spy";

const resorts = resortsData as Resort[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resortId = searchParams.get("resortId");
  const daysParam = searchParams.get("days");

  if (!resortId) {
    return NextResponse.json({ error: "Missing resortId" }, { status: 400 });
  }

  const resort = resorts.find((r) => r.id === resortId);
  if (!resort) {
    return NextResponse.json({ error: "Resort not found" }, { status: 404 });
  }

  const requestedDays = daysParam ? Number.parseInt(daysParam, 10) : Number.NaN;
  const daysToForecast =
    Number.isFinite(requestedDays) && requestedDays > 0
      ? Math.min(requestedDays, OPEN_METEO_FORECAST_MAX_DAYS)
      : OPEN_METEO_FORECAST_MAX_DAYS;

  const today = new Date();
  const pastDays = 2;

  // History: [Today - 2, Today - 1]
  const historyStart = new Date(today);
  historyStart.setDate(today.getDate() - pastDays);
  const historyEnd = new Date(today);
  historyEnd.setDate(today.getDate() - 1);

  // Forecast: [Today, Today + days - 1]
  const forecastStart = new Date(today);
  const forecastEnd = new Date(today);
  forecastEnd.setDate(today.getDate() + daysToForecast - 1);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  try {
    const [historyRes, forecastRes] = await Promise.all([
      getResortHistory(
        resort.coordinates.lat,
        resort.coordinates.lon,
        formatDate(historyStart),
        formatDate(historyEnd)
      ),
      getResortForecast(
        resort.coordinates.lat,
        resort.coordinates.lon,
        formatDate(forecastStart),
        formatDate(forecastEnd)
      ),
    ]);

    const history = historyRes.weather;
    const forecast = forecastRes.weather;
    const utcOffsetSeconds = forecastRes.utcOffsetSeconds;

    const allWeather = [...history, ...forecast];

    // Calculate "today" in the resort's timezone
    // Date.now() is based on UTC. Adding the offset gives us a timestamp that,
    // when interpreted as UTC, represents the local time.
    const resortTimeMs = Date.now() + utcOffsetSeconds * 1000;
    const resortDate = new Date(resortTimeMs);
    const todayStr = resortDate.toISOString().split("T")[0];

    let todayIndex = allWeather.findIndex((w) => w.date === todayStr);
    let dateMismatch = false;

    if (todayIndex === -1 && allWeather.length > 0) {
      dateMismatch = true;
      // Fallback: If exact match fails, try to find the immediate next day
      // or default to 0 to ensure we return *something*.
      todayIndex = allWeather.findIndex((w) => w.date > todayStr);
      if (todayIndex === -1) todayIndex = 0;
    }

    const spyData: SpyDayData[] = [];

    for (let i = 0; i < daysToForecast; i++) {
      const currentIndex = todayIndex + i;
      if (currentIndex < 0 || currentIndex >= allWeather.length) continue;

      const dayWeather = allWeather[currentIndex];

      const prev1 = allWeather[currentIndex - 1];
      const prev2 = allWeather[currentIndex - 2];

      const contextRecent: RecentWeather = {
        rainMm: 0,
        snowCm: (prev1?.snowfallSum || 0) + (prev2?.snowfallSum || 0),
        tempMin: Math.min(prev1?.tempMin ?? 0, prev2?.tempMin ?? 0),
        tempMax: Math.max(prev1?.tempMax ?? 0, prev2?.tempMax ?? 0),
      };

      const ridability = calculateRidability(dayWeather, contextRecent, "east"); // Hardcoded region for MVP, should come from resort data if available
      const bestWindow = calculateBestWindow(dayWeather, "east");

      const dayData: SpyDayData = {
        date: dayWeather.date,
        weather: dayWeather,
        ridability,
        bestWindow,
      };

      if (i === 0 && dateMismatch) {
        dayData.notes = ["Date mismatch: showing available data"];
      }

      spyData.push(dayData);
    }

    const recentSummary: RecentWeather = {
      rainMm: 0,
      snowCm: 0,
      tempMin: 0,
      tempMax: 0,
    };
    if (todayIndex >= 2) {
      recentSummary.snowCm =
        allWeather[todayIndex - 1].snowfallSum +
        allWeather[todayIndex - 2].snowfallSum;
    }

    const response: SpyModeResponse = {
      resort,
      days: spyData.length,
      data: spyData,
      recent: recentSummary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Spy API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch spy data" },
      { status: 500 }
    );
  }
}
