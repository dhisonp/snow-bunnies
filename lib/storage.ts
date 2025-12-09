import { type TripConfig } from "@/lib/types/trip";

const STORAGE_KEY = "snowbunnies_trips";

export const getTrips = (): TripConfig[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse trips from local storage", e);
    return [];
  }
};

export const saveTrip = (trip: TripConfig): void => {
  const trips = getTrips();
  const index = trips.findIndex((t) => t.id === trip.id);
  if (index >= 0) {
    trips[index] = trip;
  } else {
    trips.push(trip);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
};

export const deleteTrip = (tripId: string): void => {
  const trips = getTrips().filter((t) => t.id !== tripId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
};

export const getTrip = (tripId: string): TripConfig | undefined => {
  return getTrips().find((t) => t.id === tripId);
};
