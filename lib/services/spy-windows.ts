import type { DailyWeather } from "@/lib/types/weather";
import type { BestWindow } from "@/lib/types/spy";

export function calculateBestWindow(
  forecast: DailyWeather,
  region: "east" | "west" = "east"
): BestWindow {
  const { tempMax, tempMin, snowfallSum, windSpeedMax } = forecast;

  // 1. Powder Day
  if (snowfallSum >= 10 && tempMax <= -2) {
    return {
      window: "Opening to 11am",
      note: "Fresh tracks! Get there early.",
    };
  }

  // 2. Windy
  if (windSpeedMax >= 40) {
    return {
      window: "Midday sheltered areas",
      note: "High winds, stay low/trees.",
    };
  }

  // 3. Goldilocks (Cold Stable)
  if (tempMax <= -4) {
    return {
      window: "All day (Best 9am–2pm)",
      note: "Cold & consistent surface.",
    };
  }

  // 4. Thaw/Refreeze (Corn Cycle)
  if (tempMax > 0 && tempMin <= -4) {
    if (region === "east") {
      return {
        window: "9am – 11am",
        note: "Wait for crust to soften.",
      };
    } else {
      return {
        window: "11am – 2pm",
        note: "Late morning corn snow.",
      };
    }
  }

  // 5. Warm/Slush (No refreeze or just warm)
  if (tempMax >= 1) {
    return {
      window: "Early morning only",
      note: "Before it gets too slushy/sticky.",
    };
  }

  // Default
  return {
    window: "9am – 3pm",
    note: "Standard resort hours.",
  };
}
