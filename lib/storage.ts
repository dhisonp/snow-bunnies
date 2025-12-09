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

const INSIGHTS_KEY = "snowbunnies_expanded_insights";

export const getExpandedInsight = (
  tripId: string,
  resortId: string
): string | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(INSIGHTS_KEY);
  if (!stored) return null;
  try {
    const insights = JSON.parse(stored);
    return insights[`${tripId}_${resortId}`] || null;
  } catch (e) {
    console.error("Failed to parse insights from local storage", e);
    return null;
  }
};

export const saveExpandedInsight = (
  tripId: string,
  resortId: string,
  content: string
): void => {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(INSIGHTS_KEY);
  let insights: Record<string, string> = {};
  if (stored) {
    try {
      insights = JSON.parse(stored);
    } catch (e) {}
  }
  insights[`${tripId}_${resortId}`] = content;
  localStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
};
