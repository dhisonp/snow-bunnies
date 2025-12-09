"use client";

import React from "react";
import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod" // shadcn form usually uses zod
// import * as z from "zod"
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
import { Label } from "@/components/ui/label"; // Need to install label
import { ResortPicker } from "@/components/ResortPicker";
import { SkillLevelSelect } from "@/components/SkillLevelSelect";
import { type TripConfig } from "@/lib/types/trip";
import { saveTrip } from "@/lib/storage";

// Simple validation manually for now to save installing zod/hookform overhead if not strictly needed
// But spec implies "TripForm" which usually suggests typical form handling.
// I'll stick to controlled inputs for simplicity unless validation gets complex.

interface TripFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: TripConfig; // If present, editing
  onSave: () => void;
}

export function TripForm({ open, onOpenChange, trip, onSave }: TripFormProps) {
  const [resortId, setResortId] = React.useState(trip?.resortId || "");
  const [dateStart, setDateStart] = React.useState(trip?.dateRange.start || "");
  const [dateEnd, setDateEnd] = React.useState(trip?.dateRange.end || "");
  const [discipline, setDiscipline] = React.useState<"ski" | "snowboard">(
    trip?.userProfile.discipline || "ski"
  );
  const [skillLevel, setSkillLevel] = React.useState(
    trip?.userProfile.skillLevel || "intermediate"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resortId || !dateStart || !dateEnd) return; // Basic validation

    const newTrip: TripConfig = {
      id: trip?.id || crypto.randomUUID(),
      resortId,
      dateRange: {
        start: dateStart,
        end: dateEnd,
      },
      userProfile: {
        discipline,
        skillLevel: skillLevel as any,
      },
      createdAt: trip?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveTrip(newTrip);
    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{trip ? "Edit Trip" : "Plan a New Trip"}</DialogTitle>
          <DialogDescription>
            Enter your destination and dates to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="resort">Resort</Label>
            <ResortPicker value={resortId} onChange={setResortId} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start">Start Date</Label>
              <Input
                id="start"
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">End Date</Label>
              <Input
                id="end"
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                required
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
            <SkillLevelSelect
              value={skillLevel}
              onChange={setSkillLevel as any}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Trip</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
