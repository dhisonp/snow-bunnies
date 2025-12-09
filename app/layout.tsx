import type { Metadata } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TemperatureProvider } from "@/components/TemperatureContext";

const recursive = Recursive({
  subsets: ["latin"],
  variable: "--font-recursive",
});

export const metadata: Metadata = {
  title: "Snow Bunnies - Ski Trip Planner",
  description: "Plan your ski trip with weather, crowds, and AI insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased font-medium",
          recursive.variable
        )}
      >
        <TemperatureProvider>{children}</TemperatureProvider>
      </body>
    </html>
  );
}
