import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { generateResortInsights } from "@/lib/services/ai-insights";
import { type Resort } from "@/lib/types/resort";
import { type ResortInsights } from "@/lib/types/insights";

const CACHE_FILE = path.join(
  process.cwd(),
  "lib/data/cache/community-insights.json"
);
const RESORTS_FILE = path.join(process.cwd(), "lib/data/resorts.json");
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

async function getCachedInsights(
  resortId: string
): Promise<ResortInsights | null> {
  try {
    await fs.access(CACHE_FILE);
  } catch {
    return null;
  }

  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    const cache: Record<string, ResortInsights> = JSON.parse(data);
    const insight = cache[resortId];

    if (!insight) return null;

    const generatedAt = new Date(insight.generatedAt).getTime();
    if (Date.now() - generatedAt > CACHE_TTL_MS) {
      return null;
    }

    return insight;
  } catch (error) {
    console.error("Error reading cache file:", error);
    return null;
  }
}

async function startCacheInsights(insight: ResortInsights) {
  try {
    let cache: Record<string, ResortInsights> = {};
    try {
      const data = await fs.readFile(CACHE_FILE, "utf-8");
      cache = JSON.parse(data);
    } catch {
      // File likely doesn't exist or is empty
    }

    cache[insight.resortId] = insight;
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error("Error writing to cache file:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resortId, forceRefresh } = body;

    if (!resortId) {
      return NextResponse.json(
        { error: "resortId is required" },
        { status: 400 }
      );
    }

    if (!forceRefresh) {
      const cached = await getCachedInsights(resortId);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    const resort = await getResort(resortId);
    if (!resort) {
      return NextResponse.json({ error: "Resort not found" }, { status: 404 });
    }

    const insights = await generateResortInsights(resort);

    await startCacheInsights(insights);

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error in resort insights API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
