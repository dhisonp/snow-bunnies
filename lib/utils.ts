import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses a date string (YYYY-MM-DD) as a local date, avoiding UTC offsets.
 * e.g. "2025-01-01" -> Jan 1st 00:00 local time
 */
export function parseLocalDate(dateString: string): Date {
  // if we just do new Date("YYYY-MM-DD"), JS treats it as UTC,
  // which might be the previous day in Western timezones.
  // appending T00:00:00 makes it local time.
  return new Date(`${dateString}T00:00:00`);
}
