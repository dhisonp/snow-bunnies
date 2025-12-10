"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResortPicker } from "@/components/ResortPicker";
import { SkillLevelSelect } from "@/components/SkillLevelSelect";
import {
  type TripConfig,
  type SkillLevel,
  type Discipline,
} from "@/lib/types/trip";
import { saveTrip } from "@/lib/storage";

interface TripFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: TripConfig;
  onSave: () => void;
}

export function TripForm({ open, onOpenChange, trip, onSave }: TripFormProps) {
  const [resortId, setResortId] = React.useState(trip?.resortId || "");
  const [dateStart, setDateStart] = React.useState(trip?.dateRange.start || "");
  const [dateEnd, setDateEnd] = React.useState(trip?.dateRange.end || "");
  const [discipline, setDiscipline] = React.useState<Discipline>(
    trip?.userProfile.discipline || "ski"
  );
  const [skillLevel, setSkillLevel] = React.useState<SkillLevel>(
    trip?.userProfile.skillLevel || "intermediate"
  );
  const [error, setError] = React.useState<string | null>(null);

  // Reset state when opening/closing or changing trip
  React.useEffect(() => {
    if (open) {
      setResortId(trip?.resortId || "");
      setDateStart(trip?.dateRange.start || "");
      setDateEnd(trip?.dateRange.end || "");
      setDiscipline(trip?.userProfile.discipline || "ski");
      setSkillLevel(trip?.userProfile.skillLevel || "intermediate");
      setError(null);
    }
  }, [open, trip]);

  const validateDates = (start: string, end: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parseDate = (dateStr: string) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d);
    };

    const startDate = parseDate(start);
    const endDate = parseDate(end);

    if (startDate < today) {
      return "Trip start date cannot be in the past.";
    }

    if (endDate < startDate) {
      return "End date cannot be before start date.";
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resortId || !dateStart || !dateEnd) {
      setError("Please fill in all fields.");
      return;
    }

    const validationError = validateDates(dateStart, dateEnd);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newTrip: TripConfig = {
      id: trip?.id || crypto.randomUUID(),
      resortId,
      dateRange: {
        start: dateStart,
        end: dateEnd,
      },
      userProfile: {
        discipline,
        skillLevel: skillLevel,
      },
      createdAt: trip?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      saveTrip(newTrip);
      onSave();
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save trip");
    }
  };

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMaxDateStr = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();
  const maxDateStr = getMaxDateStr();

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateStart(val);
    setError(null);

    // If end date exists and is before new start date, update it
    if (dateEnd && val > dateEnd) {
      setDateEnd(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{trip ? "Edit Trip" : "Plan a New Trip"}</DialogTitle>
          <DialogDescription>
            Enter your destination and dates to get started. Live weather
            forecasts are available for the next 16 days; historical trends
            shown for later dates.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="resort">Resort</Label>
            <ResortPicker value={resortId} onChange={setResortId} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start">Start Date</Label>
              <Input
                id="start"
                type="date"
                value={dateStart}
                min={todayStr}
                max={maxDateStr}
                onChange={handleStartChange}
                required
                className="h-9 w-full appearance-none px-4"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">End Date</Label>
              <Input
                id="end"
                type="date"
                value={dateEnd}
                min={dateStart || todayStr}
                max={maxDateStr}
                onChange={(e) => {
                  setDateEnd(e.target.value);
                  setError(null);
                }}
                required
                className="h-9 w-full appearance-none px-4"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Discipline</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={discipline === "ski" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setDiscipline("ski")}
              >
                Ski
              </Button>
              <Button
                type="button"
                variant={discipline === "snowboard" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setDiscipline("snowboard")}
              >
                Snowboard
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="skill">Skill Level</Label>
            <SkillLevelSelect value={skillLevel} onChange={setSkillLevel} />
          </div>

          {error && (
            <div className="text-sm text-destructive font-medium">{error}</div>
          )}

          <DialogFooter>
            <Button type="submit">Save Trip</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
