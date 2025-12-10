import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type ResortInsights } from "@/lib/types/insights";
import { Lightbulb } from "lucide-react";

interface CommunityInsightsModalProps {
  insights: ResortInsights | null;
  isOpen: boolean;
  onClose: (open: boolean) => void;
  resortName: string;
}

export function CommunityInsightsModal({
  insights,
  isOpen,
  onClose,
  resortName,
}: CommunityInsightsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-none border-4 border-primary shadow-[8px_8px_0px_0px_var(--foreground)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-tight text-xl">
            <Lightbulb className="h-5 w-5 text-primary" />
            Community Insights: {resortName}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Local knowledge from Reddit & Forums
          </DialogDescription>
        </DialogHeader>
        {insights && (
          <div className="mt-4 space-y-4">
            {/* Overview */}
            <div className="border-2 border-primary rounded-none p-3 bg-muted">
              <h3 className="font-mono font-bold uppercase text-sm mb-2 tracking-tight">
                Overview
              </h3>
              <p className="text-sm leading-relaxed">{insights.overview}</p>
            </div>

            <div className="border-2 border-primary rounded-none bg-muted">
              <h3 className="font-mono font-bold uppercase text-sm p-3 border-b-2 border-primary bg-background tracking-tight">
                Local Tips
              </h3>
              <ul className="divide-y-2 divide-primary">
                {insights.localTips.map((tip, i) => (
                  <li key={i} className="p-3 text-sm flex gap-3 leading-snug">
                    <span className="font-mono font-bold text-primary shrink-0">
                      {i + 1}.
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-2 border-primary rounded-none bg-muted">
              <h3 className="font-mono font-bold uppercase text-sm p-3 border-b-2 border-primary bg-background tracking-tight">
                Best Runs by Level
              </h3>
              <div className="divide-y-2 divide-primary">
                {Object.entries(insights.bestRunsByLevel).map(
                  ([level, runs]) => (
                    <div key={level} className="p-3">
                      <h4 className="font-mono font-bold uppercase text-xs mb-2 text-primary tracking-tight">
                        {level}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {runs.map((run, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 border-2 border-primary bg-background font-medium"
                          >
                            {run}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="border-2 border-primary rounded-none bg-muted">
              <h3 className="font-mono font-bold uppercase text-sm p-3 border-b-2 border-primary bg-background tracking-tight">
                Hidden Gems
              </h3>
              <ul className="divide-y-2 divide-primary">
                {insights.hiddenGems.map((gem, i) => (
                  <li key={i} className="p-3 text-sm flex gap-3 leading-snug">
                    <span className="font-mono font-bold text-primary shrink-0">
                      •
                    </span>
                    <span>{gem}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-2 border-primary rounded-none bg-muted">
              <h3 className="font-mono font-bold uppercase text-sm p-3 border-b-2 border-primary bg-background tracking-tight">
                What to Avoid
              </h3>
              <ul className="divide-y-2 divide-primary">
                {insights.avoidList.map((item, i) => (
                  <li key={i} className="p-3 text-sm flex gap-3 leading-snug">
                    <span className="font-mono font-bold text-red-500 shrink-0">
                      ✕
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-2 border-primary rounded-none bg-muted">
              <h3 className="font-mono font-bold uppercase text-sm p-3 border-b-2 border-primary bg-background tracking-tight">
                Food Recommendations
              </h3>
              <div className="divide-y-2 divide-primary">
                <div className="p-3">
                  <h4 className="font-mono font-bold uppercase text-xs mb-2 text-primary tracking-tight">
                    On Mountain
                  </h4>
                  <ul className="space-y-1.5">
                    {insights.foodRecs.onMountain.map((rec, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3">
                  <h4 className="font-mono font-bold uppercase text-xs mb-2 text-primary tracking-tight">
                    Base / Nearby
                  </h4>
                  <ul className="space-y-1.5">
                    {insights.foodRecs.base.map((rec, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-2 border-primary rounded-none p-3 bg-muted">
              <h3 className="font-mono font-bold uppercase text-sm mb-2 tracking-tight">
                Parking Strategy
              </h3>
              <p className="text-sm leading-relaxed">
                {insights.parkingStrategy}
              </p>
            </div>

            <div className="border-2 border-primary rounded-none p-3 bg-muted">
              <h3 className="font-mono font-bold uppercase text-sm mb-2 tracking-tight">
                Crowd Patterns
              </h3>
              <p className="text-sm leading-relaxed">
                {insights.crowdPatterns}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
