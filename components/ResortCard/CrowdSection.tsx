import { type DailyCrowd } from "@/lib/types/crowd";
import { type DailyWeather, type TripComparison } from "@/lib/types/weather";
import { CrowdDetailPanel } from "@/components/CrowdDetailPanel";
import { HistoricalComparison } from "@/components/HistoricalComparison";

interface CrowdSectionProps {
  selectedDate: string | null;
  comparison: TripComparison | null;
  crowdData: DailyCrowd[];
  forecast: DailyWeather[];
}

export function CrowdSection({
  selectedDate,
  comparison,
  crowdData,
  forecast,
}: CrowdSectionProps) {
  return (
    <>
      {!selectedDate && comparison ? (
        <HistoricalComparison
          comparison={comparison}
          variant="summary"
          className="mt-4"
        />
      ) : (
        <CrowdDetailPanel
          selectedDate={selectedDate}
          crowdData={crowdData}
          weatherData={forecast}
        />
      )}
    </>
  );
}
