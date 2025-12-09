"use client";

import { Button } from "@/components/ui/button";
import { useTemperature } from "@/components/TemperatureContext";

export function TemperatureToggle() {
  const { unit, toggleUnit } = useTemperature();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleUnit}
      className="w-12 font-mono"
    >
      °{unit === "celsius" ? "C" : "F"}
    </Button>
  );
}
