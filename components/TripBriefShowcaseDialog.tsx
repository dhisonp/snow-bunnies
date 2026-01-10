"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, MapPin, Clock, AlertCircle, X } from "lucide-react";

interface TripBriefShowcaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
}

export function TripBriefShowcaseDialog({
  isOpen,
  onClose,
  onDontShowAgain,
}: TripBriefShowcaseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl rounded-none border-4 border-primary p-0 overflow-hidden max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4 sm:h-6 sm:w-6" />
            <span className="sr-only">Close</span>
          </button>

          <div className="bg-[#60a5fa] p-4 sm:p-8 border-b-4 border-foreground relative">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 sm:mb-4 animate-bounce">
                <div className="relative">
                  <div className="text-5xl sm:text-6xl">🐰</div>
                  <div className="absolute -top-1 -right-1">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                  </div>
                </div>
              </div>

              <DialogHeader className="space-y-2 sm:space-y-3">
                <DialogTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                  NEW: TRIP BRIEF
                </DialogTitle>
                <DialogDescription className="text-base sm:text-lg font-bold text-black">
                  Your AI-Powered Snow Sherpa
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="border-l-4 border-primary bg-muted p-3 sm:p-4">
              <p className="font-bold text-sm sm:text-base mb-2">
                Stop winging it. Start crushing it.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Trip Brief is your personalized game plan for every ski day. It
                reads the weather, analyzes the crowds, and tells you exactly
                where to go and when. No more guessing. No more FOMO. Just pure,
                unadulterated powder strategy.
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex gap-2 sm:gap-3 items-start">
                <div className="p-1.5 sm:p-2 border-2 border-foreground bg-green-500/10 shrink-0">
                  <Clock
                    className="h-4 w-4 sm:h-6 sm:w-6 text-green-600"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm mb-0.5">
                    Daily Tactical Breakdown
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Get the play-by-play for each day: best time slots, which
                    zones to hit, and where to avoid the zoo. Make every run
                    count.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 items-start">
                <div className="p-1.5 sm:p-2 border-2 border-foreground bg-blue-500/10 shrink-0">
                  <MapPin
                    className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm mb-0.5">
                    Zone Intelligence
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    North face holding powder while the south side is ice? We
                    know. We&apos;ll route you to the good stuff and save you
                    from the crud.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 items-start">
                <div className="p-1.5 sm:p-2 border-2 border-foreground bg-orange-500/10 shrink-0">
                  <AlertCircle
                    className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm mb-0.5">
                    Real Alerts
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ice storm incoming? Holiday weekend madness? We&apos;ll warn
                    you before you waste a lift ticket on a nightmare.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 items-start">
                <div className="p-1.5 sm:p-2 border-2 border-foreground bg-purple-500/10 shrink-0">
                  <Zap
                    className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm mb-0.5">
                    Gear Recommendations
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Bring the fat skis or leave them home? Rock shells or
                    insulation? We&apos;ll tell you what to pack so you&apos;re
                    not over-geared or underprepared.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-foreground bg-primary text-primary-foreground p-4 text-center">
              <p className="font-black uppercase text-sm tracking-wide">
                Available on every tracked trip.
                <br />
                No extra cost. No BS.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Button
                onClick={onClose}
                size="lg"
                className="border-2 font-bold uppercase shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                Let&apos;s Go
              </Button>
              <Button
                onClick={onDontShowAgain}
                size="lg"
                variant="outline"
                className="border-2 font-bold uppercase shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                Don&apos;t Show Again
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
