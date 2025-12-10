import { useState, useEffect } from "react";
import { type ResortInsights } from "@/lib/types/insights";

interface UseResortInsightsResult {
  insights: ResortInsights | null;
  isLoading: boolean;
  error: string | null;
}

export function useResortInsights(resortId: string): UseResortInsightsResult {
  const [insights, setInsights] = useState<ResortInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchInsights() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/insights/resort", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resortId }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch insights");
        }

        const data = await response.json();
        if (mounted) {
          setInsights(data);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to fetch insights:", err);
          setError("Failed to load insights");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchInsights();

    return () => {
      mounted = false;
    };
  }, [resortId]);

  return { insights, isLoading, error };
}
