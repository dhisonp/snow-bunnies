import { type NextRequest, NextResponse } from "next/server";
import { generateExpandedInsight } from "@/lib/services/ai-insights";
import fs from "fs/promises";
import path from "path";
import { type Resort } from "@/lib/types/resort";

const RESORTS_FILE = path.join(process.cwd(), "lib/data/resorts.json");

async function getResort(resortId: string): Promise<Resort | null> {
  try {
    const data = await fs.readFile(RESORTS_FILE, "utf-8");
    const resorts: Resort[] = JSON.parse(data);
    return resorts.find((r) => r.id === resortId) || null;
  } catch (error) {
    console.error("Error reading resorts file:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resortId, tripConfig } = body;

    if (!resortId || !tripConfig) {
      return NextResponse.json(
        { error: "resortId and tripConfig are required" },
        { status: 400 }
      );
    }

    const resort = await getResort(resortId);
    if (!resort) {
      return NextResponse.json({ error: "Resort not found" }, { status: 404 });
    }

    const expandedInsight = await generateExpandedInsight(resort, tripConfig);

    return NextResponse.json({ insight: expandedInsight });
  } catch (error) {
    console.error("Error in expanded insight API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
