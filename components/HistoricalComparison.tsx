import { type TripComparison } from "@/lib/types/weather";
import { Card } from "@/components/ui/card";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Thermometer,
  CloudSnow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";

interface HistoricalComparisonProps {
  comparison: TripComparison;
  variant?: "summary" | "detailed";
  className?: string;
}

export function HistoricalComparison({
  comparison,
  variant = "summary",
}: HistoricalComparisonProps) {
  if (variant === "summary") {
    let snowColor = "text-muted-foreground";
    if (comparison.summary.snowfallVerdict.includes("above")) {
      snowColor = "text-emerald-500";
    } else if (comparison.summary.snowfallVerdict.includes("below")) {
      snowColor = "text-amber-500";
    }

    let tempColor = "text-muted-foreground";
    const tempVerdictLower = comparison.summary.tempVerdict.toLowerCase();
    if (tempVerdictLower.includes("warmer")) {
      tempColor = "text-amber-500";
    } else if (tempVerdictLower.includes("colder")) {
      tempColor = "text-blue-500";
    }

    return (
      <div className="space-y-4 mt-4">
        <SectionHeader>Historical Context</SectionHeader>

        <Card className="rounded-none border-2 border-primary bg-muted p-0 shadow-[4px_4px_0px_0px_var(--foreground)]">
          <div className="space-y-0">
            <div className="flex items-start gap-4 p-4 border-b-2 border-primary bg-background">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center border-2 border-primary text-primary">
                <CloudSnow className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 font-bold font-mono uppercase tracking-tight">
                  <span className={cn(snowColor, "text-sm")}>
                    {comparison.summary.snowfallVerdict}
                  </span>
                  {comparison.summary.snowfallVerdict.includes("above") && (
                    <ArrowUpIcon
                      className={cn("h-4 w-4 stroke-3", snowColor)}
                    />
                  )}
                  {comparison.summary.snowfallVerdict.includes("below") && (
                    <ArrowDownIcon
                      className={cn("h-4 w-4 stroke-3", snowColor)}
                    />
                  )}
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {Math.round(comparison.summary.totalForecastSnow)}cm forecast
                  vs {Math.round(comparison.summary.totalHistoricalSnow)}cm avg
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border-b-2 border-primary bg-background">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center border-2 border-primary text-primary">
                <Thermometer className="h-4 w-4" />
              </div>
              <div>
                <div
                  className={cn(
                    "font-bold font-mono uppercase tracking-tight text-sm",
                    tempColor
                  )}
                >
                  {comparison.summary.tempVerdict}
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Compared to 5-year average
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted/50">
              <p className="text-xs font-medium leading-relaxed font-mono">
                {comparison.summary.caption.replace(/✨\s*/g, "")}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
}
