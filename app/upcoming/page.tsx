"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  category: "Weather" | "Crowds" | "AI Insights" | "UX Polish" | "Resorts";
}

const upcomingFeatures: Feature[] = [
  {
    title: "Open-Meteo Historical API",
    description:
      "Enhanced historical weather data integration showing trends across past 8-10 years for more accurate comparisons.",
    category: "Weather",
  },
  {
    title: "Google Popular Times Integration",
    description:
      "Real-time crowd data from Google to provide more accurate lift line and parking predictions.",
    category: "Crowds",
  },
  {
    title: "Per-Day Details",
    description:
      "Detailed expandable views for each day showing hourly breakdowns of weather, crowds, and conditions.",
    category: "UX Polish",
  },
  {
    title: "Dynamic Resorts",
    description:
      "Allow users to add custom resorts beyond the pre-configured list, with automatic coordinate and elevation lookup.",
    category: "Resorts",
  },
  {
    title: "Airbnb & Accommodation Tips",
    description:
      "AI-generated recommendations for nearby lodging, including optimal areas to stay and booking strategies.",
    category: "AI Insights",
  },
  {
    title: "Trip Briefs",
    description:
      "Personalized AI-generated trip summaries with daily game plans, gear considerations, and warnings tailored to your skill level and trip dates.",
    category: "AI Insights",
  },
  {
    title: "Historical Comparison Component",
    description:
      "Visual comparison charts showing current forecast vs. historical averages with confidence indicators.",
    category: "Weather",
  },
  {
    title: "Crowd Calendar",
    description:
      "Multi-day calendar view showing crowd predictions at a glance for easier trip planning.",
    category: "Crowds",
  },
];

const categories = [
  "Weather",
  "Crowds",
  "AI Insights",
  "UX Polish",
  "Resorts",
] as const;

export default function UpcomingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="border-b-2 border-foreground">
        <div className="container mx-auto px-3 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              Upcoming Features
            </h1>
          </div>
          <Link
            href="https://github.com/dhisonp/snow-bunnies"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="border-2">
              <Github className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-3 py-4 flex-1">
        <div className="max-w-2xl mx-auto">
          <div
            className="border-2 border-foreground bg-card p-4 mb-8"
            style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
          >
            <p className="text-base">
              The following features are planned for future releases. These
              enhancements will improve weather accuracy, crowd predictions, and
              overall user experience.
            </p>
          </div>

          {categories.map((category) => {
            const categoryFeatures = upcomingFeatures.filter(
              (f) => f.category === category
            );
            if (categoryFeatures.length === 0) return null;

            return (
              <div key={category} className="space-y-3 mb-8 mt-8 first:mt-0">
                <h2 className="text-xl font-bold border-b-2 border-foreground pb-2">
                  {category}
                </h2>
                <div className="space-y-3">
                  {categoryFeatures.map((feature) => (
                    <div
                      key={feature.title}
                      className="border-2 border-foreground bg-card p-4"
                      style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
                    >
                      <h3 className="font-bold text-base mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
