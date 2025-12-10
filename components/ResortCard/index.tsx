import { useState } from "react";
import { type TripConfig } from "@/lib/types/trip";
import { type Resort } from "@/lib/types/resort";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { ResortCardHeader } from "./ResortCardHeader";
import { WeatherSection } from "./WeatherSection";
import { CrowdSection } from "./CrowdSection";
import { InsightsSection } from "./InsightsSection";
import { TripBriefModal } from "./TripBriefModal";
import { PredictionModal } from "./PredictionModal";
import { CommunityInsightsModal } from "./CommunityInsightsModal";

import { useWeatherForecast } from "./hooks/useWeatherForecast";
import { useCrowdData } from "./hooks/useCrowdData";
import { useResortInsights } from "./hooks/useResortInsights";
import { useTripBrief } from "./hooks/useTripBrief";

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCommunityInsights, setShowCommunityInsights] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  const {
    forecast,
    isHistorical,
    comparison,
    isLoading: weatherLoading,
    error: weatherError,
  } = useWeatherForecast(resort, trip);

  const { crowdData, isLoading: crowdLoading } = useCrowdData(
    forecast,
    resort.id
  );

  const {
    insights,
    isLoading: insightsLoading,
    error: insightsError,
  } = useResortInsights(resort.id);

  const {
    tripBrief,
    isLoading: briefLoading,
    error: briefError,
    generateBrief,
    regenerate,
  } = useTripBrief(trip, resort);

  const isGlobalLoading = weatherLoading || crowdLoading || insightsLoading;

  const handleGetTripBrief = async () => {
    if (isHistorical) {
      setShowPredictionModal(true);
      return;
    }
    const success = await generateBrief(forecast, crowdData, insights);
    if (success) {
      setShowBrief(true);
    }
  };

  const handleRegenerate = async () => {
    await regenerate(forecast, crowdData, insights);
  };

  return (
    <Card className="relative min-h-[600px] overflow-hidden flex flex-col">
      <ResortCardHeader
        trip={trip}
        resort={resort}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <CardContent className="flex flex-col gap-3 pb-6 flex-1">
        <WeatherSection
          forecast={forecast}
          isHistorical={isHistorical}
          error={weatherError}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {forecast.length > 0 && !weatherError && (
          <CrowdSection
            selectedDate={selectedDate}
            comparison={comparison}
            crowdData={crowdData}
            forecast={forecast}
          />
        )}

        <InsightsSection
          insights={insights}
          insightsError={insightsError}
          onShowCommunityInsights={() => setShowCommunityInsights(true)}
          onGenerateTripBrief={handleGetTripBrief}
          briefLoading={briefLoading}
          briefError={briefError}
        />

        <CommunityInsightsModal
          insights={insights}
          isOpen={showCommunityInsights}
          onClose={setShowCommunityInsights}
          resortName={resort.name}
        />

        <TripBriefModal
          tripBrief={tripBrief}
          isOpen={showBrief}
          onClose={setShowBrief}
          onRegenerate={handleRegenerate}
          isLoading={briefLoading}
        />

        <PredictionModal
          isOpen={showPredictionModal}
          onClose={setShowPredictionModal}
        />
      </CardContent>

      {isGlobalLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background backdrop-blur-sm transition-all duration-200">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-1 mt-4">
            <p className="font-mono text-lg font-bold uppercase tracking-widest">
              Planning Trip
            </p>
            <p className="text-xs text-muted-foreground font-mono uppercase">
              Fetching weather & intel...
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
