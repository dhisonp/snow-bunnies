export interface ResortInsights {
  resortId: string;
  generatedAt: string;
  overview: string; // 2-3 sentence resort summary
  localTips: string[]; // 5-8 actionable tips
  bestRunsByLevel: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
    expert: string[];
  };
  hiddenGems: string[]; // Lesser-known spots
  avoidList: string[]; // Tourist traps, bad lifts
  foodRecs: {
    onMountain: string[];
    base: string[];
  };
  parkingStrategy: string;
  crowdPatterns: string; // General crowd behavior
  sources: string[]; // Reddit threads, forums used
}

export interface TripBrief {
  tripId: string;
  generatedAt: string;
  weatherFingerprint?: string;
  summary: string; // Personalized 3-4 sentence brief
  dailyGamePlan: {
    date: string;
    recommendation: string; // What to do that day
    bestTimeSlot: string;
    targetZones: string[]; // Areas of mountain to hit
  }[];
  gearConsiderations: string[]; // Based on forecast
  warningsAndAlerts: string[]; // Weather, crowds, closures
}
