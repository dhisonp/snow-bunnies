import { type DailyCrowd, type HourlyCrowd } from "@/lib/types/crowd";
import { type DailyWeather } from "@/lib/types/weather";
import holidaysData from "@/lib/data/holidays.json";

interface HolidayEntry {
  date: string;
  name: string;
  crowdImpact: number;
}

const holidays = holidaysData["2025-2026"] as HolidayEntry[];

function getHolidayInfo(date: string): { name: string; impact: number } | null {
  const holiday = holidays.find((h) => h.date === date);
  if (holiday) {
    return { name: holiday.name, impact: holiday.crowdImpact };
  }
  return null;
}

function getDayOfWeek(date: string): number {
  return new Date(date).getDay();
}

function getBaseCrowdLevel(date: string): {
  level: number;
  dayType: "weekday" | "weekend" | "holiday";
} {
  const holiday = getHolidayInfo(date);
  if (holiday) {
    return { level: holiday.impact, dayType: "holiday" };
  }

  const dayOfWeek = getDayOfWeek(date);

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { level: 4, dayType: "weekend" };
  }
  if (dayOfWeek === 5) {
    return { level: 3, dayType: "weekday" };
  }
  return { level: 2, dayType: "weekday" };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function generateHourlyBreakdown(baseLevel: number): HourlyCrowd[] {
  const hours: HourlyCrowd[] = [];

  for (let hour = 7; hour <= 17; hour++) {
    let crowdLevel = baseLevel;

    if (hour >= 7 && hour < 9) {
      crowdLevel = baseLevel - 1;
    } else if (hour >= 9 && hour < 12) {
      crowdLevel = baseLevel + 1;
    } else if (hour >= 12 && hour < 14) {
      crowdLevel = baseLevel;
    } else if (hour >= 14 && hour < 16) {
      crowdLevel = baseLevel - 1;
    } else if (hour >= 16) {
      crowdLevel = baseLevel - 2;
    }

    hours.push({
      hour,
      crowdLevel: clamp(crowdLevel, 1, 5),
      source: "heuristic",
    });
  }

  return hours;
}

function calculatePeakHours(hourly: HourlyCrowd[]): string {
  let maxLevel = 0;
  let peakStart = 9;
  let peakEnd = 12;

  for (const h of hourly) {
    if (h.crowdLevel > maxLevel) {
      maxLevel = h.crowdLevel;
    }
  }

  const peakHours = hourly.filter((h) => h.crowdLevel === maxLevel);
  if (peakHours.length > 0) {
    peakStart = peakHours[0].hour;
    peakEnd = peakHours[peakHours.length - 1].hour + 1;
  }

  const formatHour = (h: number) => {
    if (h === 12) return "12pm";
    if (h > 12) return `${h - 12}pm`;
    return `${h}am`;
  };

  return `${formatHour(peakStart)} - ${formatHour(peakEnd)}`;
}

function calculateBestArrivalTime(hourly: HourlyCrowd[]): string {
  for (const h of hourly) {
    if (h.crowdLevel <= 2) {
      if (h.hour < 9) {
        return `Before ${h.hour + 1}:30am`;
      }
    }
  }
  return "Before 8:30am";
}

export function estimateCrowds(
  dates: string[],
  weatherData: DailyWeather[] = []
): DailyCrowd[] {
  const weatherByDate = new Map<string, DailyWeather>();
  for (const w of weatherData) {
    weatherByDate.set(w.date, w);
  }

  return dates.map((date) => {
    const { level: baseLevel, dayType } = getBaseCrowdLevel(date);
    const holiday = getHolidayInfo(date);

    let adjustedLevel = baseLevel;

    const weather = weatherByDate.get(date);
    if (weather && weather.snowfallSum > 15) {
      adjustedLevel = clamp(adjustedLevel + 1, 1, 5);
    }

    const hourlyBreakdown = generateHourlyBreakdown(adjustedLevel);
    const peakHours = calculatePeakHours(hourlyBreakdown);
    const bestArrivalTime = calculateBestArrivalTime(hourlyBreakdown);

    return {
      date,
      dayType: holiday ? "holiday" : dayType,
      holidayName: holiday?.name,
      overallLevel: adjustedLevel,
      hourlyBreakdown,
      peakHours,
      bestArrivalTime,
    };
  });
}
