import { Card, CardContent } from "@/components/ui/card";
import { CloudRain, Snowflake, Sun } from "lucide-react";

export function WeatherPrediction() {
  return (
    <Card className="border-2 border-primary border-dashed bg-muted/50 rounded-none h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="flex gap-4 mb-4 text-muted-foreground/50">
        <Snowflake className="h-8 w-8" />
        <Sun className="h-8 w-8" />
        <CloudRain className="h-8 w-8" />
      </div>
      <h3 className="font-mono font-bold text-lg uppercase tracking-tight mb-2">
        Long Range Forecast
      </h3>
      <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
        This trip is too far in the future for live weather data. Check back
        closer to your trip date for real-time forecasts.
      </p>
    </Card>
  );
}
