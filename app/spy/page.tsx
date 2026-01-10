"use client";

import { useState, useEffect } from "react";
import { SpyModeHeader } from "@/components/SpyMode/SpyModeHeader";
import { SpyOverviewRow } from "@/components/SpyMode/SpyOverviewRow";
import { SpyDayCard } from "@/components/SpyMode/SpyDayCard";
import { type SpyDayData } from "@/lib/types/spy";
import { Skeleton } from "@/components/ui/skeleton";
import { OPEN_METEO_FORECAST_MAX_DAYS } from "@/lib/constants/open-meteo";

import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2 } from "lucide-react";
import { useResortInsights } from "@/components/ResortCard/hooks/useResortInsights";
import { CommunityInsightsModal } from "@/components/ResortCard/CommunityInsightsModal";
import resorts from "@/lib/data/resorts.json";
import { type Resort } from "@/lib/types/resort";

export default function SpyPage() {
  const [selectedResortId, setSelectedResortId] = useState("");
  const [data, setData] = useState<SpyDayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const days = OPEN_METEO_FORECAST_MAX_DAYS;

  const { insights, isLoading: insightsLoading } =
    useResortInsights(selectedResortId);
  const selectedResort = (resorts as Resort[]).find(
    (r) => r.id === selectedResortId
  );

  useEffect(() => {
    if (!selectedResortId) return;

    setLoading(true);
    setError(null);
    fetch(`/api/spy?resortId=${selectedResortId}&days=${days}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load spy data");
        return res.json();
      })
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json.data);
      })
      .catch((err) => {
        setError(err.message);
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [selectedResortId, days]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <SpyModeHeader
        selectedResortId={selectedResortId}
        onResortChange={setSelectedResortId}
        betaOpenByDefault
      />

      <main className="max-w-7xl mx-auto w-full">
        {!selectedResortId ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>Select a resort to spy on.</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>Error: {error}</p>
            <button
              onClick={() => setSelectedResortId((old) => old)} // Retry hack or just re-select
              className="underline mt-2"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <div className="px-4 pt-4 pb-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-bold uppercase tracking-wide text-xs"
                onClick={() => setShowInsightsModal(true)}
                disabled={insightsLoading || !insights}
              >
                {insightsLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Lightbulb className="h-3.5 w-3.5" />
                )}
                View All Insights
              </Button>
            </div>

            <SpyOverviewRow
              data={data}
              onDayClick={(date) => {
                const el = document.getElementById(`day-${date}`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.map((day) => (
                <div
                  key={day.date}
                  id={`day-${day.date}`}
                  className="w-full h-full"
                >
                  <SpyDayCard data={day} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <CommunityInsightsModal
        insights={insights}
        isOpen={showInsightsModal}
        onClose={setShowInsightsModal}
        resortName={selectedResort?.name || "Resort"}
      />
    </div>
  );
}
