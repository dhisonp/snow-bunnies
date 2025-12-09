import fs from "fs/promises";
import { readFileSync } from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex);
        const value = trimmed.slice(eqIndex + 1);
        process.env[key] = value;
      }
    }
  }
} catch {
  console.warn("Could not load .env file");
}

import { generateResortInsights } from "../lib/services/ai-insights";
import { type Resort } from "../lib/types/resort";
import { type ResortInsights } from "../lib/types/insights";

const CACHE_FILE = path.join(
  process.cwd(),
  "lib/data/cache/community-insights.json"
);
const RESORTS_FILE = path.join(process.cwd(), "lib/data/resorts.json");

async function main() {
  console.log("Loading resorts...");
  const resortsData = await fs.readFile(RESORTS_FILE, "utf-8");
  const resorts: Resort[] = JSON.parse(resortsData);

  let cache: Record<string, ResortInsights> = {};
  try {
    const cacheData = await fs.readFile(CACHE_FILE, "utf-8");
    cache = JSON.parse(cacheData);
  } catch {
    console.log("No existing cache found, starting fresh.");
  }

  const missingResorts = resorts.filter((r) => !cache[r.id]);

  if (missingResorts.length === 0) {
    console.log("All resorts already have cached insights.");
    return;
  }

  console.log(
    `Found ${missingResorts.length} resorts without cached insights:`
  );
  missingResorts.forEach((r) => console.log(`  - ${r.name} (${r.id})`));

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  for (const resort of missingResorts) {
    console.log(`\nGenerating insights for ${resort.name}...`);

    let retries = 3;
    while (retries > 0) {
      try {
        const insights = await generateResortInsights(resort);
        cache[resort.id] = insights;
        console.log(`  ✓ Generated insights for ${resort.name}`);
        await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
        break;
      } catch (error) {
        retries--;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("429") || errorMessage.includes("quota")) {
          const waitTime = (4 - retries) * 10000;
          console.log(
            `  ⏳ Rate limited, waiting ${waitTime / 1000}s before retry (${retries} retries left)...`
          );
          await delay(waitTime);
        } else {
          console.error(
            `  ✗ Failed to generate insights for ${resort.name}:`,
            error
          );
          break;
        }
      }
    }

    console.log(`  ⏳ Waiting 5s before next resort...`);
    await delay(5000);
  }

  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log("\nCache updated successfully.");
}

main().catch(console.error);
