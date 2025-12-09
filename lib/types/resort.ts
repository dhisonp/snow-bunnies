export interface Resort {
  id: string; // e.g., "heavenly-tahoe"
  name: string; // e.g., "Heavenly"
  region: string; // e.g., "Lake Tahoe"
  state: string; // e.g., "CA"
  coordinates: {
    lat: number;
    lon: number;
  };
  elevation: {
    base: number; // feet
    summit: number;
  };
  trailCount: number;
  liftCount: number;
  terrainPct: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  googlePlaceId?: string; // For Popular Times lookup
  subreddit?: string; // e.g., "tahoe"
  forumUrls?: string[]; // TGR, etc.
}
