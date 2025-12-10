import { type TripConfig, type SkillLevel } from "@/lib/types/trip";

const STORAGE_KEY = "snowbunnies_trips";
export const MAX_TRIPS = 3;

const getNextWeekend = (): { start: string; end: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay();
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7;

  const thursday = new Date(today);
  thursday.setDate(today.getDate() + daysUntilThursday);

  const sunday = new Date(thursday);
  sunday.setDate(thursday.getDate() + 3);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    start: formatDate(thursday),
    end: formatDate(sunday),
  };
};

const createDefaultTrip = (): TripConfig => {
  const weekend = getNextWeekend();
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    resortId: "hunter-mountain",
    dateRange: {
      start: weekend.start,
      end: weekend.end,
    },
    userProfile: {
      discipline: "ski",
      skillLevel: "beginner",
    },
    createdAt: now,
    updatedAt: now,
  };
};

export const initializeDefaultTrip = (): void => {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(STORAGE_KEY) !== null) return;

  const defaultTrip = createDefaultTrip();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultTrip]));
};

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
    if (trips.length >= MAX_TRIPS) {
      throw new Error(`Maximum of ${MAX_TRIPS} trips allowed`);
    }
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
    } catch {}
  }
  insights[`${tripId}_${resortId}`] = content;
  localStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
};

const BRIEF_KEY = "snowbunnies_trip_briefs";
import { type TripBrief } from "@/lib/types/insights";

export const getTripBrief = (
  tripId: string,
  resortId: string
): TripBrief | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(BRIEF_KEY);
  if (!stored) return null;
  try {
    const briefs = JSON.parse(stored);
    return briefs[`${tripId}_${resortId}`] || null;
  } catch (e) {
    console.error("Failed to parse trip briefs from local storage", e);
    return null;
  }
};

export const saveTripBrief = (
  tripId: string,
  resortId: string,
  brief: TripBrief
): void => {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(BRIEF_KEY);
  let briefs: Record<string, TripBrief> = {};
  if (stored) {
    try {
      briefs = JSON.parse(stored);
    } catch {}
  }
  briefs[`${tripId}_${resortId}`] = brief;
  localStorage.setItem(BRIEF_KEY, JSON.stringify(briefs));
};

export type SharedTripData = {
  resortId: string;
  dateRange: { start: string; end: string };
  userProfile: { discipline: "ski" | "snowboard"; skillLevel: SkillLevel };
};

export const createTripFromShared = (data: SharedTripData): TripConfig => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    resortId: data.resortId,
    dateRange: data.dateRange,
    userProfile: data.userProfile,
    createdAt: now,
    updatedAt: now,
  };
};

export const encodeTrip = (trip: TripConfig): string => {
  const sharedData: SharedTripData = {
    resortId: trip.resortId,
    dateRange: trip.dateRange,
    userProfile: trip.userProfile,
  };
  return btoa(JSON.stringify(sharedData));
};

export const decodeTrip = (encoded: string): SharedTripData | null => {
  try {
    const decoded = atob(encoded);
    const data = JSON.parse(decoded) as SharedTripData;

    if (
      !data.resortId ||
      !data.dateRange?.start ||
      !data.dateRange?.end ||
      !data.userProfile?.discipline ||
      !data.userProfile?.skillLevel
    ) {
      return;
    }

    return data;
  } catch {}
};
