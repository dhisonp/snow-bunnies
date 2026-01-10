import { NextResponse } from "next/server";
import { getResortForecast } from "@/lib/services/open-meteo";

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

  try {
    const { weather } = await getResortForecast(
      parseFloat(lat),
      parseFloat(lon),
      start,
      end
    );
    return NextResponse.json(weather);
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
