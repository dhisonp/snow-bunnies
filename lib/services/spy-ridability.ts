import type { DailyWeather } from "@/lib/types/weather";
import type { RecentWeather, Ridability } from "@/lib/types/spy";

export function calculateRidability(
  forecast: DailyWeather,
  recent: RecentWeather,
  region: "east" | "west" = "east"
): Ridability {
  let score = 50;
  const reasons: string[] = [];

  // Snowfall (forecast-only for now)
  const snowCm = forecast.snowfallSum;
  if (snowCm >= 20) {
    score += 20;
    reasons.push("Deep fresh snow (>20cm)");
  } else if (snowCm >= 10) {
    score += 12;
    reasons.push("Good snow accumulation (10-19cm)");
  } else if (snowCm >= 3) {
    score += 6;
    reasons.push("Dusting of fresh snow");
  }

  // Rain / Mixed Precip
  const snowfallMm = forecast.snowfallSum * 10;
  const estimatedRainMm = Math.max(0, forecast.precipitationSum - snowfallMm);
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(
    forecast.weatherCode
  );

  if (isRainy || (estimatedRainMm > 0 && forecast.tempMax > 2)) {
    const penalty = region === "east" ? 1.2 : 1.0;
    if (forecast.precipitationSum >= 10) {
      score -= 20 * penalty;
      reasons.push("Heavy rain expected");
    } else if (forecast.precipitationSum >= 3) {
      score -= 12 * penalty;
      reasons.push("Light rain / Wet conditions");
    } else {
      score -= 6 * penalty;
      reasons.push("Possible drizzle");
    }
  }

  // Temperature / Surface
  const tempMax = forecast.tempMax;
  if (tempMax <= -6) {
    score += 10;
    reasons.push("Cold, preservable temps");
  } else if (tempMax <= -2) {
    score += 6;
    reasons.push("Cold enough");
  } else if (tempMax <= 1) {
    // Neutral
  } else if (tempMax <= 3) {
    score -= 8;
    reasons.push("Warm (soft/heavy)");
  } else {
    score -= 15;
    reasons.push("Very warm (slush/spring)");
  }

  // Thaw/Refreeze
  if (forecast.tempMax > 0 && forecast.tempMin <= -4) {
    score += 8;
    reasons.push("Corn snow cycle (Melt/Freeze)");
  }

  // Wind
  const windSpeedMax = forecast.windSpeedMax;
  if (windSpeedMax >= 40) {
    score -= 6;
    reasons.push("High winds");
  } else if (windSpeedMax >= 24) {
    score -= 3;
    reasons.push("Breezy");
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  return {
    score: Math.round(score),
    label: getRidabilityLabel(score),
    reasons,
  };
}

function getRidabilityLabel(score: number): Ridability["label"] {
  if (score >= 90) return "Prime";
  if (score >= 80) return "Great";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}
