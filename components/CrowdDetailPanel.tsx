import { type DailyCrowd } from "@/lib/types/crowd";
import { type DailyWeather } from "@/lib/types/weather";
import { DayCrowdCard } from "./DayCrowdCard";

interface CrowdDetailPanelProps {
  selectedDate: string | null;
  crowdData: DailyCrowd[];
  weatherData: DailyWeather[];
}

export function CrowdDetailPanel({
  selectedDate,
  crowdData,
  weatherData,
}: CrowdDetailPanelProps) {
  if (selectedDate) {
    const dayCrowd = crowdData.find((c) => c.date === selectedDate);
    const dayWeather = weatherData.find((w) => w.date === selectedDate);

    if (!dayCrowd) {
      return (
        <div className="p-4 border-2 border-primary bg-muted/10 text-center text-muted-foreground font-mono text-sm">
          No data for selected date.
        </div>
      );
    }

    return (
      <div className="animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="mb-2 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
            Selected Day
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {selectedDate}
          </span>
        </div>
        <DayCrowdCard crowd={dayCrowd} weather={dayWeather} />
      </div>
    );
  }

  const hoursMap = new Map<number, number>();
  let dayCount = 0;

  if (crowdData.length > 0) {
    crowdData.forEach((day) => {
      dayCount++;
      day.hourlyBreakdown.forEach((h) => {
        const current = hoursMap.get(h.hour) || 0;
        hoursMap.set(h.hour, current + h.crowdLevel);
      });
    });
  }

  const averageHourly = Array.from(hoursMap.entries())
    .map(([hour, sum]) => ({
      hour,
      crowdLevel: Math.round(sum / dayCount),
      source: "heuristic" as const,
    }))
    .sort((a, b) => a.hour - b.hour);

  let peakStart = 9;
  let peakEnd = 12;
  const maxLvl = Math.max(...averageHourly.map((h) => h.crowdLevel), 0);
  const peakHoursArr = averageHourly.filter((h) => h.crowdLevel >= maxLvl);
  if (peakHoursArr.length > 0) {
    peakStart = peakHoursArr[0].hour;
    peakEnd = peakHoursArr[peakHoursArr.length - 1].hour + 1;
  }
  const formatHour = (h: number) =>
    h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`;
  const peakString = `${formatHour(peakStart)} - ${formatHour(peakEnd)}`;

  const avgLevel = Math.round(
    crowdData.reduce((sum, d) => sum + d.overallLevel, 0) /
      (crowdData.length || 1)
  );

  // Construct "Fake" DailyCrowd for the overview
  const overviewCrowd: DailyCrowd = {
    date: new Date().toISOString(), // Dummy date not used for display in this mode
    dayType: "weekday", // dummy
    overallLevel: avgLevel,
    hourlyBreakdown: averageHourly,
    peakHours: peakString,
    bestArrivalTime: "Before 8:30am", // heuristic
    holidayName: crowdData.some((d) => d.holidayName)
      ? "Contains Holiday"
      : undefined,
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
            Trip Overview
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            Average Conditions
          </span>
        </div>
      </div>

      <DayCrowdCard
        crowd={overviewCrowd}
        // We pass a dummy weather object or null.
        // If null, weather section is hidden.
        weather={undefined}
        titleOverride="TRIP AVG"
      />
    </div>
  );
}
