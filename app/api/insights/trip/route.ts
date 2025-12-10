import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { generateTripBrief } from "@/lib/services/ai-insights";
import { type Resort } from "@/lib/types/resort";

const RESORTS_FILE = path.join(process.cwd(), "lib/data/resorts.json");

async function getResortName(resortId: string): Promise<string> {
  try {
    const data = await fs.readFile(RESORTS_FILE, "utf-8");
    const resorts: Resort[] = JSON.parse(data);
    const resort = resorts.find((r) => r.id === resortId);
    return resort ? resort.name : resortId;
  } catch (error) {
    console.error("Error reading resorts file:", error);
    return resortId;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tripConfig,
      weatherData,
      historicalComparison,
      crowdData,
      resortInsights,
    } = body;

    if (!tripConfig || !weatherData || !crowdData || !resortInsights) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: tripConfig, weatherData, crowdData, resortInsights",
        },
        { status: 400 }
      );
    }

    const resortName = await getResortName(tripConfig.resortId);

    const tripBrief = await generateTripBrief(
      tripConfig,
      weatherData,
      historicalComparison || [],
      crowdData,
      resortInsights,
      resortName
    );

    return NextResponse.json(tripBrief);
  } catch (error) {
    console.error("Error in trip insights API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
