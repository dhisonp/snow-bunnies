import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";
import { type ResortInsights, type TripBrief } from "@/lib/types/insights";
import { type Resort } from "@/lib/types/resort";
import { type TripConfig } from "@/lib/types/trip";
import { type DailyWeather } from "@/lib/types/weather";
import { type DailyCrowd } from "@/lib/types/crowd";

let cachedModel: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!cachedModel) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. AI features will not work.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    cachedModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
  }
  return cachedModel;
}

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
    const result = await getModel().generateContent(prompt);
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
  crowdData: DailyCrowd[],
  resortInsights: ResortInsights,
  resortName: string
): Promise<TripBrief> {
  const tempRange = {
    min: Math.min(...weatherData.map((d) => d.tempMin)),
    max: Math.max(...weatherData.map((d) => d.tempMax)),
  };
  const totalSnow = weatherData.reduce((sum, d) => sum + d.snowfallSum, 0);
  const snowDays = weatherData
    .filter((d) => d.snowfallSum > 0)
    .map((d) => d.date);
  const windyDays = weatherData
    .filter((d) => d.windSpeedMax > 40)
    .map((d) => d.date);

  const weatherByDay = weatherData
    .map((d) => {
      const conditions: string[] = [];
      if (d.snowfallSum > 0) conditions.push(`${d.snowfallSum}cm snow`);
      if (d.windSpeedMax > 40) conditions.push(`windy (${d.windSpeedMax}km/h)`);
      if (d.precipitationProbability > 60)
        conditions.push(`${d.precipitationProbability}% precip`);

      return `${d.date}: ${d.tempMin}°C to ${d.tempMax}°C${conditions.length ? " - " + conditions.join(", ") : ""}`;
    })
    .join("\n");

  const crowdByDay = crowdData
    .map((d) => {
      const label = [
        "",
        "Very Light",
        "Light",
        "Moderate",
        "Busy",
        "Very Busy",
      ][d.overallLevel];
      const note = d.holidayName
        ? ` (${d.holidayName})`
        : d.dayType === "weekend"
          ? " (Weekend)"
          : "";
      return `${d.date}: ${label}${note}`;
    })
    .join("\n");

  const prompt = `
You are generating a ski trip brief. You MUST use the exact weather data provided below.

## TRIP INFO
- Resort: ${resortName}
- Dates: ${trip.dateRange.start} to ${trip.dateRange.end}
- Skier: ${trip.userProfile.skillLevel} ${trip.userProfile.discipline}

## WEATHER FORECAST (USE THESE EXACT VALUES)
Temperature range for trip: ${tempRange.min}°C to ${tempRange.max}°C
Total snowfall expected: ${totalSnow}cm
${snowDays.length > 0 ? `Snow days: ${snowDays.join(", ")}` : "No snow expected"}
${windyDays.length > 0 ? `High wind days: ${windyDays.join(", ")}` : ""}

Daily breakdown:
${weatherByDay}

## CROWD FORECAST
${crowdByDay}

## RESORT INFO
Best runs for ${trip.userProfile.skillLevel}: ${resortInsights?.bestRunsByLevel?.[trip.userProfile.skillLevel.toLowerCase() as keyof typeof resortInsights.bestRunsByLevel]?.join(", ") || "See trail map"}
Local tips: ${resortInsights?.localTips?.slice(0, 3).join("; ") || "None available"}

---

Generate a JSON response. Your gear recommendations MUST match the temperature range (${tempRange.min}°C to ${tempRange.max}°C).

${tempRange.max > 5 ? "NOTE: This is a WARM trip. Do NOT recommend heavy insulation." : ""}
${tempRange.min < -10 ? "NOTE: This is a COLD trip. Emphasize warmth and skin protection." : ""}
${totalSnow > 30 ? "NOTE: Significant snow expected. Mention powder strategy." : ""}

{
  "summary": "3-4 sentences mentioning specific temps (${tempRange.min}°C to ${tempRange.max}°C) and conditions",
  "dailyGamePlan": [
    // One entry per day: ${weatherData.map((d) => d.date).join(", ")}
    {
      "date": "YYYY-MM-DD",
      "weather": "That day's actual conditions from the forecast",
      "crowdLevel": "From crowd forecast above",
      "recommendation": "Specific advice for this day",
      "bestTimeSlot": "When to ski based on crowds",
      "targetZones": ["Specific runs from resort info"]
    }
  ],
  "gearConsiderations": [
    // MUST match ${tempRange.min}°C to ${tempRange.max}°C range
    // If temps > 0°C, mention lighter layers
    // If temps < -10°C, mention heavy insulation
  ],
  "warningsAndAlerts": [
    // Only include if there are actual concerns from the data
  ]
}
`;

  try {
    const result = await getModel().generateContent(prompt);
    const text = result.response.text();

    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(cleanJson);

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

/**
 * @deprecated Use generateTripBrief for superior and more accurate insights.
 */
export async function generateExpandedInsight(
  resort: Resort,
  trip: TripConfig
): Promise<string> {
  const prompt = `
You are a local ski expert providing a deep-dive analysis for ${resort.name}.

User Profile:
- Skill Level: ${trip.userProfile.skillLevel}
- Discipline: ${trip.userProfile.discipline}
- Dates: ${trip.dateRange.start} to ${trip.dateRange.end}

Provide a comprehensive, "local's only" guide for this specific user. Focus on:
1. **Specific Run Progressions**: Suggested sequences of runs for their skill level.
2. **Hidden Stashes**: Where to find the best conditions given the time of year (${trip.dateRange.start}).
3. **Logistics Hacks**: Best parking, lunch spots to avoid crowds, bathroom breaks.
4. **Après & Culture**: Authentic spots, not just the main tourist bars.

Format the response in Markdown. Be conversational, authoritative, and encouraging.
`;

  try {
    const result = await getModel().generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "text/plain",
      },
    });
    return result.response.text();
  } catch (error) {
    console.error("Error generating expanded insight:", error);
    throw new Error("Failed to generate expanded insight");
  }
}
