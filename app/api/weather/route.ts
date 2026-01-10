import { NextResponse } from "next/server";
import { getResortForecast, getResortHistory } from "@/lib/services/open-meteo";
import { type DailyWeather } from "@/lib/types/weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!lat || !lon || !start || !end) {
    return NextResponse.json(
      { error: "Missing required query parameters" },
      { status: 400 }
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const latNumber = parseFloat(lat);
  const lonNumber = parseFloat(lon);

  const addDaysUtc = (dateStr: string, days: number) => {
    const date = new Date(`${dateStr}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split("T")[0];
  };

  const mergeByDate = (items: DailyWeather[]) => {
    const byDate = new Map<string, DailyWeather>();
    for (const item of items) {
      byDate.set(item.date, item);
    }
    return Array.from(byDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  };

  try {
    if (end < today) {
      const { weather } = await getResortHistory(
        latNumber,
        lonNumber,
        start,
        end
      );
      return NextResponse.json(mergeByDate(weather));
    }

    if (start < today && today <= end) {
      const yesterday = addDaysUtc(today, -1);
      const [historyRes, forecastRes] = await Promise.all([
        getResortHistory(latNumber, lonNumber, start, yesterday),
        getResortForecast(latNumber, lonNumber, today, end),
      ]);
      return NextResponse.json(
        mergeByDate([...historyRes.weather, ...forecastRes.weather])
      );
    }

    const { weather } = await getResortForecast(
      latNumber,
      lonNumber,
      start,
      end
    );
    return NextResponse.json(mergeByDate(weather));
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
