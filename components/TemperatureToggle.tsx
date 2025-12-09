"use client";

import { Button } from "@/components/ui/button";
import { useUnits } from "@/components/TemperatureContext";

export function TemperatureToggle() {
  const { system, toggleSystem } = useUnits();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSystem}
      className="w-20 font-mono text-xs"
    >
      {system === "metric" ? "METRIC" : "IMPERIAL"}
    </Button>
  );
}
