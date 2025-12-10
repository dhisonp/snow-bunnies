export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type Discipline = "ski" | "snowboard";

export interface TripConfig {
  id: string; // UUID
  resortId: string;
  dateRange: {
    start: string; // ISO date: "2025-12-18"
    end: string; // ISO date: "2025-12-22"
  };
  userProfile: {
    discipline: Discipline;
    skillLevel: SkillLevel;
  };
  createdAt: string;
  updatedAt: string;
}
