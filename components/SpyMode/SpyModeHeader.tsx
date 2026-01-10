"use client";
import { ResortPicker } from "@/components/ResortPicker";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OPEN_METEO_FORECAST_MAX_DAYS } from "@/lib/constants/open-meteo";
import { TemperatureToggle } from "@/components/TemperatureToggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SpyModeHeaderProps {
  selectedResortId: string;
  onResortChange: (id: string) => void;
}

export function SpyModeHeader({
  selectedResortId,
  onResortChange,
}: SpyModeHeaderProps) {
  const [showBetaInfo, setShowBetaInfo] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 p-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Spy Mode</h1>
            <Badge
              variant="outline"
              className="cursor-pointer"
              onClick={() => setShowBetaInfo(true)}
            >
              Beta
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <TemperatureToggle />
            <Badge variant="outline" className="text-xs">
              {OPEN_METEO_FORECAST_MAX_DAYS}-day forecast
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Monitor daily conditions and find the perfect window to ride.
        </p>

        <div className="w-[320px] pt-2 mx-auto">
          <ResortPicker value={selectedResortId} onChange={onResortChange} />
        </div>
      </div>

      <Dialog open={showBetaInfo} onOpenChange={setShowBetaInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">🕵️</span>
              Spy Mode Beta
            </DialogTitle>
            <DialogDescription>
              <strong>Spy Mode</strong> is your tactical dashboard for analyzing
              resort conditions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-base">
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
              <li>
                Detailed {OPEN_METEO_FORECAST_MAX_DAYS}-day weather breakdown
              </li>
              <li>
                Daily &quot;Ridability Scores&quot; based on wind, temp, and
                snow
              </li>
              <li>Best time windows to hit the slopes</li>
            </ul>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
              This feature is currently in <strong>Beta</strong>. We&apos;re
              still tuning the scoring algorithms and data sources to ensure
              maximum accuracy for your missions.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
