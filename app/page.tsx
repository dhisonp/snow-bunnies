"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TripForm } from "@/components/TripForm";
import { ResortCard } from "@/components/ResortCard";
import { TemperatureToggle } from "@/components/TemperatureToggle";
import { ModeToggle } from "@/components/ModeToggle";
import { type TripConfig } from "@/lib/types/trip";
import { getTrips, deleteTrip } from "@/lib/storage";
import resortsData from "@/lib/data/resorts.json";
import { type Resort } from "@/lib/types/resort";
import { Plus, Sparkles } from "lucide-react";

export default function Home() {
  const [trips, setTrips] = React.useState<TripConfig[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTrip, setEditingTrip] = React.useState<TripConfig | undefined>(
    undefined
  );

  const loadTrips = () => {
    setTrips(getTrips());
  };

  useEffect(() => {
    loadTrips();
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-3 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
          <h1 className="text-2xl font-bold tracking-tight text-center md:text-left">
            Snow Bunnies
          </h1>
          <div className="flex items-center gap-2 flex-wrap justify-center md:flex-nowrap md:justify-end">
            <Link href="/upcoming">
              <Button variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" /> Upcoming
              </Button>
            </Link>
            <TemperatureToggle />
            <ModeToggle />
            <Button onClick={handleCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" /> New Trip
            </Button>
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
    </div>
  );
}
