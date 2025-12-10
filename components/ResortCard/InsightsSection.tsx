import { Button } from "@/components/ui/button";
import { type ResortInsights } from "@/lib/types/insights";
import { AlertCircle, Lightbulb, Loader2, Zap } from "lucide-react";

interface InsightsSectionProps {
  insights: ResortInsights | null;
  insightsError: string | null;
  onShowCommunityInsights: () => void;
  onGenerateTripBrief: () => void;
  briefLoading: boolean;
  briefError: string | null;
}

export function InsightsSection({
  insights,
  insightsError,
  onShowCommunityInsights,
  onGenerateTripBrief,
  briefLoading,
  briefError,
}: InsightsSectionProps) {
  if (insightsError) {
    return (
      <div className="border-2 border-red-500 bg-red-500/10 p-3 rounded-none flex items-center gap-2 text-red-600 mt-auto">
        <AlertCircle className="h-5 w-5" />
        <span className="font-bold text-sm uppercase">
          Insight Check Failed
        </span>
      </div>
    );
  }

  if (insights && insights.localTips.length > 0) {
    return (
      <div className="border-2 border-primary p-0 rounded-none bg-muted mt-auto">
        <div className="flex items-center justify-between p-3 border-b-2 border-primary bg-background">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" strokeWidth={2.5} />
            <span className="font-mono font-bold text-sm uppercase tracking-tight">
              AI Resort Insights
            </span>
          </div>
        </div>
        <div className="p-2 bg-background">
          <Button
            variant="ghost"
            size="sm"
            className="w-full rounded-none font-bold uppercase tracking-wide gap-2 text-xs h-8 border-2"
            onClick={onShowCommunityInsights}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            View All Insights
          </Button>
        </div>
        <ul className="divide-y-2 divide-primary">
          {insights.localTips.slice(0, 3).map((tip, i) => (
            <li
              key={i}
              className="p-3 text-sm font-medium flex gap-3 leading-snug"
            >
              <span className="font-mono font-bold text-primary shrink-0">
                {i + 1}.
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <div className="p-2 border-t-2 border-primary bg-background grid grid-cols-1 gap-2">
          <Button
            variant="default"
            size="sm"
            className="w-full rounded-none font-bold uppercase tracking-wide gap-2 text-xs h-8"
            onClick={onGenerateTripBrief}
            disabled={briefLoading}
          >
            {briefLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5 fill-current" />
            )}
            {briefLoading ? "Generating..." : "Get Trip Brief"}
          </Button>
          {briefError && (
            <p className="text-[10px] text-destructive font-mono mt-1 text-center font-bold">
              {briefError}
            </p>
          )}
        </div>
      </div>
    );
  }
}
