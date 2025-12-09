import { type HourlyCrowd } from "@/lib/types/crowd";

interface CrowdChartProps {
  data: HourlyCrowd[];
  peakHours: string;
  bestArrivalTime: string;
}

export function CrowdChart({
  data,
  peakHours,
  bestArrivalTime,
}: CrowdChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No crowd data available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end h-24 gap-1">
        {data.map((hour) => (
          <div
            key={hour.hour}
            className="flex-1 rounded-t-sm transition-all hover:opacity-80 relative group"
            style={{
              height: `${(hour.crowdLevel / 5) * 100}%`,
              backgroundColor: `var(--crowd-${hour.crowdLevel})`,
            }}
          >
            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 text-xs bg-popover border p-1 rounded whitespace-nowrap z-10">
              {hour.hour}:00 - Level {hour.crowdLevel}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>7am</span>
        <span>12pm</span>
        <span>5pm</span>
      </div>
      <div className="flex gap-4 text-sm">
        <div>
          Peak: <span className="font-medium">{peakHours}</span>
        </div>
        <div>
          Best:{" "}
          <span className="font-medium text-green-600">{bestArrivalTime}</span>
        </div>
      </div>
    </div>
  );
}
