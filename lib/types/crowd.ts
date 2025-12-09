export interface HourlyCrowd {
  hour: number; // 0-23
  crowdLevel: number; // 1-5 scale
  source: "google" | "heuristic" | "community";
}

export interface DailyCrowd {
  date: string;
  dayType: "weekday" | "weekend" | "holiday";
  holidayName?: string; // e.g., "Christmas Week"
  overallLevel: number; // 1-5
  hourlyBreakdown: HourlyCrowd[];
  peakHours: string; // e.g., "10am-1pm"
  bestArrivalTime: string; // e.g., "Before 8:30am"
  communityNotes?: string[]; // Scraped tips
}
