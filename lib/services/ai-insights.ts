import { GoogleGenerativeAI } from "@google/generative-ai";
import { type ResortInsights, type TripBrief } from "@/lib/types/insights";
import { type Resort } from "@/lib/types/resort";
import { type TripConfig } from "@/lib/types/trip";
import {
  type DailyWeather,
  type HistoricalComparison,
} from "@/lib/types/weather";
import { type DailyCrowd } from "@/lib/types/crowd";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export async function generateResortInsights(
  resort: Resort,
  scrapedContent?: string
): Promise<ResortInsights> {
  const context = scrapedContent
    ? `Based on the following community discussions and reviews:\n<community_data>\n${scrapedContent}\n</community_data>`
    : "Using your extensive internal knowledge as a local ski expert and data from reputable sources (e.g., OnTheSnow, PeakRankings, etc.),";

  const prompt = `
You are a local ski expert synthesizing community knowledge about ${resort.name}.

${context}

Generate insights in the following JSON structure:
{
  "overview": "2-3 sentence resort character summary",
  "localTips": ["5-8 actionable insider tips"],
  "bestRunsByLevel": {
    "beginner": ["run names"],
    "intermediate": ["run names"],
    "advanced": ["run names"],
    "expert": ["run names"]
  },
  "hiddenGems": ["lesser-known spots locals love"],
  "avoidList": ["tourist traps, inefficient lifts, overpriced spots"],
  "foodRecs": {
    "onMountain": ["lodges/restaurants"],
    "base": ["nearby town spots"]
  },
  "parkingStrategy": "when to arrive, which lots, tips",
  "crowdPatterns": "general crowd behavior and patterns"
}

Be specific. Use actual run names, lift names, and locations. Prioritize actionable advice over generic tips.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    return {
      resortId: resort.id,
      generatedAt: new Date().toISOString(),
      sources: ["Reddit", "Forums"], // Placeholder, ideally this comes from scrapedContent metadata
      ...data,
    };
  } catch (error) {
    console.error("Error generating resort insights:", error);
    throw new Error("Failed to generate resort insights");
  }
}

export async function generateTripBrief(
  trip: TripConfig,
  weatherData: DailyWeather[],
  historicalComparison: HistoricalComparison[],
  crowdData: DailyCrowd[],
  resortInsights: ResortInsights,
  resortName: string
): Promise<TripBrief> {
  const prompt = `
Generate a personalized ski trip brief.

Trip Details:
- Resort: ${resortName}
- Dates: ${trip.dateRange.start} to ${trip.dateRange.end}
- Skier Profile: ${trip.userProfile.skillLevel} ${trip.userProfile.discipline}

Weather Forecast:
${JSON.stringify(weatherData, null, 2)}

Historical Comparison:
${JSON.stringify(historicalComparison, null, 2)}

Crowd Predictions:
${JSON.stringify(crowdData, null, 2)}

Resort Knowledge:
${JSON.stringify(resortInsights, null, 2)}

Generate a trip brief in the following JSON structure:
{
  "summary": "3-4 sentence personalized overview of what to expect",
  "dailyGamePlan": [
    {
        "date": "YYYY-MM-DD",
        "recommendation": "What to prioritize that day given weather/crowds",
        "bestTimeSlot": "Optimal skiing hours",
        "targetZones": ["Specific areas/lifts to focus on for their skill level"]
    }
  ],
  "gearConsiderations": ["Based on forecast (goggles, layers, etc.)"],
  "warningsAndAlerts": ["Any concerns (wind holds, holiday crowds, etc.)"]
}

Tailor all recommendations to a ${trip.userProfile.skillLevel} ${trip.userProfile.discipline}er. Be specific and actionable.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    return {
      tripId: trip.id,
      generatedAt: new Date().toISOString(),
      ...data,
    };
  } catch (error) {
    console.error("Error generating trip brief:", error);
    throw new Error("Failed to generate trip brief");
  }
}
