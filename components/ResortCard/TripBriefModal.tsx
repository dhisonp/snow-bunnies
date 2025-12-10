import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type TripBrief } from "@/lib/types/insights";
import {
  AlertCircle,
  CalendarPlus,
  Zap,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface TripBriefModalProps {
  tripBrief: TripBrief | null;
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
  canRefresh?: boolean;
  hoursUntilRefresh?: number;
}

export function TripBriefModal({
  tripBrief,
  isOpen,
  onClose,
  onRegenerate,
  isLoading = false,
  canRefresh = true,
  hoursUntilRefresh = 0,
}: TripBriefModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-none border-4 border-primary">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-tight text-xl">
                <Zap className="h-5 w-5 text-primary fill-current" />
                Trip Brief
              </DialogTitle>
              <DialogDescription className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Your personalized action plan
              </DialogDescription>
            </div>
            {onRegenerate && (
              <div className="flex flex-col items-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRegenerate}
                  disabled={isLoading || !canRefresh}
                  className="font-mono uppercase text-xs"
                  title={
                    !canRefresh
                      ? `Available in ${hoursUntilRefresh} hour${hoursUntilRefresh > 1 ? "s" : ""}`
                      : undefined
                  }
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-1">Refresh</span>
                </Button>
                {!canRefresh && (
                  <span className="text-xs text-muted-foreground">
                    Available in {hoursUntilRefresh}h
                  </span>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {tripBrief && (
          <div className="mt-4 space-y-6">
            <div className="p-4 bg-muted border-l-4 border-primary">
              <p className="text-sm font-medium leading-relaxed">
                {tripBrief.summary}
              </p>
            </div>

            <div>
              <h3 className="font-mono font-bold uppercase text-sm mb-3 flex items-center gap-2">
                <CalendarPlus className="h-4 w-4" />
                Daily Game Plan
              </h3>
              <div className="space-y-4">
                {tripBrief.dailyGamePlan.map((plan, i) => (
                  <div key={i} className="border-2 border-primary p-3 relative">
                    <div className="absolute -top-3 left-3 bg-background px-2 text-xs font-mono font-bold border-2 border-primary">
                      {plan.date}
                    </div>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm font-bold">{plan.recommendation}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-primary text-primary-foreground px-2 py-0.5 font-bold">
                          {plan.bestTimeSlot}
                        </span>
                        {plan.targetZones.map((zone, z) => (
                          <span
                            key={z}
                            className="border border-primary px-2 py-0.5"
                          >
                            {zone}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-primary p-3">
                <h3 className="font-mono font-bold uppercase text-xs mb-2 bg-primary text-primary-foreground inline-block px-1">
                  Gear Check
                </h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {tripBrief.gearConsiderations.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {tripBrief.warningsAndAlerts.length > 0 && (
                <div className="border-2 border-red-500 bg-red-500/10 p-3 text-red-600">
                  <h3 className="font-mono font-bold uppercase text-xs mb-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Alerts
                  </h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {tripBrief.warningsAndAlerts.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
