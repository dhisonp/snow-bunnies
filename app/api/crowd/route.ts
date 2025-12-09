import { type NextRequest, NextResponse } from "next/server";
import { estimateCrowds } from "@/lib/services/crowd-estimator";
import { type DailyWeather } from "@/lib/types/weather";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dates, weatherData } = body as {
      dates: string[];
      weatherData?: DailyWeather[];
    };

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json(
        { error: "dates array is required", code: "INVALID_DATE_RANGE" },
        { status: 400 }
      );
    }

    const crowds = estimateCrowds(dates, weatherData || []);

    return NextResponse.json({ crowds });
  } catch (error) {
    console.error("Error in crowd API:", error);
    return NextResponse.json(
      { error: "Failed to estimate crowd data", code: "CROWD_FETCH_FAILED" },
      { status: 500 }
    );
  }
}
