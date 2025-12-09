"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Unit = "celsius" | "fahrenheit";

interface TemperatureContextType {
  unit: Unit;
  toggleUnit: () => void;
}

const TemperatureContext = createContext<TemperatureContextType | undefined>(
  undefined
);

export function TemperatureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unit, setUnit] = useState<Unit>("celsius");

  useEffect(() => {
    const savedUnit = localStorage.getItem("tempUnit") as Unit;
    if (savedUnit) {
      setUnit(savedUnit);
    }
  }, []);

  const toggleUnit = () => {
    setUnit((prev) => {
      const newUnit = prev === "celsius" ? "fahrenheit" : "celsius";
      localStorage.setItem("tempUnit", newUnit);
      return newUnit;
    });
  };

  return (
    <TemperatureContext.Provider value={{ unit, toggleUnit }}>
      {children}
    </TemperatureContext.Provider>
  );
}

export function useTemperature() {
  const context = useContext(TemperatureContext);
  if (context === undefined) {
    throw new Error("useTemperature must be used within a TemperatureProvider");
  }
  return context;
}
