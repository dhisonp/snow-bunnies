import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type TripConfig } from "@/lib/types/trip";
import { type Resort } from "@/lib/types/resort";
import { WeatherForecast } from "./WeatherForecast";
import { CrowdChart } from "./CrowdChart";
import {
  ChevronDown,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { type DailyWeather } from "@/lib/types/weather";
import { type HourlyCrowd } from "@/lib/types/crowd";
import { getResortForecast } from "@/lib/services/open-meteo";

const mockCrowd: HourlyCrowd[] = Array.from({ length: 11 }, (_, i) => ({
  hour: 7 + i,
  crowdLevel: i < 3 ? 1 : i < 7 ? 4 : 2,
  source: "heuristic",
})) as HourlyCrowd[];

interface ResortCardProps {
  trip: TripConfig;
  resort: Resort;
  onEdit: () => void;
  onDelete: () => void;
}

export function ResortCard({
  trip,
  resort,
  onEdit,
  onDelete,
}: ResortCardProps) {
  const [forecast, setForecast] = useState<DailyWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchWeather() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getResortForecast(
          resort.coordinates.lat,
          resort.coordinates.lon,
          trip.dateRange.start,
          trip.dateRange.end
        );
        if (mounted) {
          setForecast(data);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to fetch weather:", err);
          setError("Failed to load weather forecast");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      mounted = false;
    };
  }, [
    resort.coordinates.lat,
    resort.coordinates.lon,
    trip.dateRange.start,
    trip.dateRange.end,
  ]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">{resort.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {resort.region}, {resort.state}
          </div>
          <div className="text-sm font-medium mt-1">
            {trip.dateRange.start} - {trip.dateRange.end}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {trip.userProfile.skillLevel} {trip.userProfile.discipline}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="min-h-[200px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Loading forecast...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <WeatherForecast forecast={forecast} />
          )}
        </div>

        <div className="border rounded-md p-3 bg-muted/20">
          <div className="text-sm font-medium mb-1">Historical Average</div>
          <p className="text-xs text-muted-foreground">
            Normally 8cm snowfall this week. Current forecast is{" "}
            <span className="text-green-600 font-medium">above average</span>.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Crowd Forecast</div>
            <div className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
              Moderate
            </div>
          </div>
          <CrowdChart
            data={mockCrowd}
            peakHours="10am - 2pm"
            bestArrivalTime="Before 8:30am"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb
              className="h-5 w-5 text-yellow-600"
              strokeWidth={2.5}
              strokeLinecap="square"
            />
            <span className="font-medium text-sm">Resort Insights</span>
          </div>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Hit Mott Canyon before 10am to avoid lines.</li>
            <li>Avoid the gondola at peak times, take the tram.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
