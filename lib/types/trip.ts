export interface TripConfig {
  id: string; // UUID
  resortId: string;
  dateRange: {
    start: string; // ISO date: "2025-12-18"
    end: string; // ISO date: "2025-12-22"
  };
  userProfile: {
    discipline: "ski" | "snowboard";
    skillLevel: "beginner" | "intermediate" | "advanced" | "expert";
  };
  createdAt: string;
  updatedAt: string;
}
