"use client";

import { Button } from "@/components/ui/button";
import { useUnits } from "@/components/TemperatureContext";
import { Thermometer } from "lucide-react";

export function TemperatureToggle() {
  const { system, toggleSystem } = useUnits();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSystem}
      className="w-24 font-mono text-xs"
    >
      <Thermometer className="mr-2 h-4 w-4" />
      {system === "metric" ? "°C / cm" : "°F / in"}
    </Button>
  );
}
