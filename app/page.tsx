"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TripForm } from "@/components/TripForm";
import { ResortCard } from "@/components/ResortCard";
import { TemperatureToggle } from "@/components/TemperatureToggle";
import { ModeToggle } from "@/components/ModeToggle";
import { type TripConfig } from "@/lib/types/trip";
import {
  getTrips,
  deleteTrip,
  initializeDefaultTrip,
  MAX_TRIPS,
  decodeTrip,
  createTripFromShared,
  saveTrip,
} from "@/lib/storage";
import resortsData from "@/lib/data/resorts.json";
import { type Resort } from "@/lib/types/resort";
import { Plus, Sparkles, Info, AlertCircle, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TripBriefShowcaseDialog } from "@/components/TripBriefShowcaseDialog";

export default function Home() {
  const [trips, setTrips] = React.useState<TripConfig[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTrip, setEditingTrip] = React.useState<TripConfig | undefined>(
    undefined
  );
  const [showMaxTripsError, setShowMaxTripsError] = React.useState(false);
  const [showShowcase, setShowShowcase] = useState(false);

  const loadTrips = () => {
    setTrips(getTrips());
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const sharedTrip = params.get("trip");
    if (sharedTrip) {
      const tripData = decodeTrip(sharedTrip);
      if (tripData) {
        const newTrip = createTripFromShared(tripData);
        try {
          saveTrip(newTrip);
        } catch {
          setShowMaxTripsError(true);
        }
      }
      window.history.replaceState({}, "", "/");
    } else {
      initializeDefaultTrip();
    }

    loadTrips();

    const hasSeenShowcase = localStorage.getItem("hasSeenTripBriefShowcase");
    if (!hasSeenShowcase) {
      setShowShowcase(true);
    }
  }, []);

  const handleCreate = () => {
    setEditingTrip(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (trip: TripConfig) => {
    setEditingTrip(trip);
    setIsFormOpen(true);
  };

  const handleDelete = (tripId: string) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      deleteTrip(tripId);
      loadTrips();
    }
  };

  const handleSave = () => {
    loadTrips();
    setIsFormOpen(false);
  };

  const getResort = (resortId: string) => {
    return (resortsData as Resort[]).find((r) => r.id === resortId);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem("hasSeenTripBriefShowcase", "true");
    setShowShowcase(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <TripBriefShowcaseDialog
        isOpen={showShowcase}
        onClose={() => setShowShowcase(false)}
        onDontShowAgain={handleDontShowAgain}
      />
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-3 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
          <h1 className="text-2xl font-bold tracking-tight text-center md:text-left">
            Snow Bunnies
          </h1>
          <div className="flex items-center gap-2 flex-wrap justify-center md:flex-nowrap md:justify-end">
            <Link href="/about">
              <Button variant="ghost" size="sm">
                <Info className="mr-2 h-4 w-4" /> What is this?
              </Button>
            </Link>
            <Link href="/upcoming">
              <Button variant="ghost" size="sm">
                <Sparkles className="mr-2 h-4 w-4" /> Upcoming
              </Button>
            </Link>
            <Link href="/spy">
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" /> Spy Mode
              </Button>
            </Link>
            <TemperatureToggle />
            <ModeToggle />
            {trips.length >= MAX_TRIPS ? (
              <div className="flex items-center gap-2">
                <Button
                  disabled
                  size="sm"
                  className="opacity-50 cursor-not-allowed"
                >
                  Max {MAX_TRIPS} Trips
                </Button>
              </div>
            ) : (
              <Button onClick={handleCreate} size="sm">
                <Plus className="mr-2 h-4 w-4" /> New Trip
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-4 flex-1">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="text-6xl">🐰</div>
            <h2 className="text-2xl font-semibold">No trips planned yet</h2>
            <p className="text-muted-foreground max-w-md">
              Get started by planning your next powder adventure. We&apos;ll
              help you find the best weather and avoid the crowds.
            </p>
            <Button size="lg" onClick={handleCreate}>
              Plan First Trip
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => {
              const resort = getResort(trip.resortId);
              if (!resort) return null;
              return (
                <ResortCard
                  key={trip.id}
                  trip={trip}
                  resort={resort}
                  onEdit={() => handleEdit(trip)}
                  onDelete={() => handleDelete(trip.id)}
                />
              );
            })}
          </div>
        )}
      </main>

      <TripForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        trip={editingTrip}
        onSave={handleSave}
      />

      <Dialog open={showMaxTripsError} onOpenChange={setShowMaxTripsError}>
        <DialogContent className="max-w-md rounded-none border-4 border-destructive bg-background shadow-[8px_8px_0px_0px_var(--foreground)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-tight text-xl text-destructive">
              <AlertCircle className="h-5 w-5 fill-current" />
              Maximum Trips Reached
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              You already have {MAX_TRIPS} trips planned. to add this shared
              trip, you need to delete one of your existing trips first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowMaxTripsError(false)}
              className="w-full rounded-none font-bold uppercase"
              variant="default"
            >
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
