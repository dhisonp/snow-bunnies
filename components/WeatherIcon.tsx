import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherIconProps {
  code: number;
  className?: string;
  strokeWidth?: number;
}

export function WeatherIcon({
  code,
  className = "h-8 w-8",
  strokeWidth = 2.5,
}: WeatherIconProps) {
  // WMO Weather interpretation codes (WW)
  // Code	Description
  // 0	Clear sky
  // 1, 2, 3	Mainly clear, partly cloudy, and overcast
  // 45, 48	Fog and depositing rime fog
  // 51, 53, 55	Drizzle: Light, moderate, and dense intensity
  // 56, 57	Freezing Drizzle: Light and dense intensity
  // 61, 63, 65	Rain: Slight, moderate and heavy intensity
  // 66, 67	Freezing Rain: Light and heavy intensity
  // 71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
  // 77	Snow grains
  // 80, 81, 82	Rain showers: Slight, moderate, and violent
  // 85, 86	Snow showers slight and heavy
  // 95 *	Thunderstorm: Slight or moderate
  // 96, 99 *	Thunderstorm with slight and heavy hail

  if (code === 0) {
    return (
      <Sun
        className={cn("text-orange-500", className)}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (code >= 1 && code <= 3) {
    return (
      <CloudSun
        className={cn("text-amber-500", className)}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (code === 45 || code === 48) {
    return (
      <CloudFog
        className={cn("text-stone-500", className)}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (code >= 51 && code <= 57) {
    return (
      <CloudDrizzle
        className={cn("text-blue-400", className)}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (code >= 61 && code <= 67) {
    return (
      <CloudRain
        className={cn("text-blue-600", className)}
        strokeWidth={strokeWidth}
      />
    );
  }

  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return (
      <CloudSnow
        className={cn("text-cyan-500", className)}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (code >= 80 && code <= 82) {
    return (
      <CloudRain
        className={cn("text-blue-600", className)}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (code >= 95 && code <= 99) {
    return (
      <CloudLightning
        className={cn("text-purple-500", className)}
        strokeWidth={strokeWidth}
      />
    );
  }

  // Fallback
  return (
    <Cloud
      className={cn("text-gray-500", className)}
      strokeWidth={strokeWidth}
    />
  );
}
