"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type UnitSystem = "metric" | "imperial";

interface UnitsContextType {
  system: UnitSystem;
  toggleSystem: () => void;
  formatTemp: (celsius: number) => number;
  formatWind: (kmh: number) => number;
  formatSnow: (cm: number) => number;
  formatPrecip: (mm: number) => number;
  tempUnit: string;
  windUnit: string;
  snowUnit: string;
  precipUnit: string;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [system, setSystem] = useState<UnitSystem>("imperial");

  useEffect(() => {
    const savedSystem = localStorage.getItem("unitSystem") as UnitSystem;
    if (savedSystem) {
      setSystem(savedSystem);
    }
  }, []);

  const toggleSystem = () => {
    setSystem((prev) => {
      const newSystem = prev === "metric" ? "imperial" : "metric";
      localStorage.setItem("unitSystem", newSystem);
      return newSystem;
    });
  };

  const formatTemp = (celsius: number) => {
    if (system === "imperial") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const formatWind = (kmh: number) => {
    if (system === "imperial") {
      return Math.round(kmh * 0.621371);
    }
    return Math.round(kmh);
  };

  const formatSnow = (cm: number) => {
    if (system === "imperial") {
      return Math.round(cm * 0.393701 * 100) / 100;
    }
    return Math.round(cm * 100) / 100;
  };

  const formatPrecip = (mm: number) => {
    if (system === "imperial") {
      return Math.round(mm * 0.0393701 * 100) / 100;
    }
    return Math.round(mm * 100) / 100;
  };

  const tempUnit = system === "imperial" ? "°F" : "°C";
  const windUnit = system === "imperial" ? "mph" : "km/h";
  const snowUnit = system === "imperial" ? "in" : "cm";
  const precipUnit = system === "imperial" ? "in" : "mm";

  return (
    <UnitsContext.Provider
      value={{
        system,
        toggleSystem,
        formatTemp,
        formatWind,
        formatSnow,
        formatPrecip,
        tempUnit,
        windUnit,
        snowUnit,
        precipUnit,
      }}
    >
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  const context = useContext(UnitsContext);
  if (context === undefined) {
    throw new Error("useUnits must be used within a UnitsProvider");
  }
  return context;
}

export const useTemperature = useUnits;
