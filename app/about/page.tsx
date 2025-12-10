"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Feature {
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    title: "Easy Access to Local Info",
    description:
      "No research required. Everything you need to plan your trip is in one place—weather, crowds, and local knowledge. Quick decision making without the hassle.",
  },
  {
    title: "Deeper Local Insight",
    description:
      "AI-powered recommendations synthesized from community knowledge. Real insider tips about runs, parking, food, and what to avoid. The kind of stuff locals know.",
  },
  {
    title: "Community-Scraped Answers",
    description:
      "Real-time updates from Reddit and forums (actively improving). Local knowledge from actual skiers, not marketing copy. What people actually say about conditions and crowds.",
  },
  {
    title: "Made by a Skier, for Skiers",
    description:
      "No frills philosophy. Just works. Nice to use. Built by someone who skis, for people who ski. No sign-ups, no accounts, no BS.",
  },
  {
    title: "Prediction Data",
    description:
      "16-day weather forecasts with historical comparisons. Working on improving accuracy for further-out trips. No guessing. We'll be honest on what we know and not know!",
  },
  {
    title: "Crowd Predictions",
    description:
      "Avoid lift lines. Know when to arrive. Holiday awareness built in. Hourly breakdowns so you can time your day right.",
  },
];

export default function AboutPage() {
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
            <h1 className="text-2xl font-bold tracking-tight">What is this?</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-4 flex-1">
        <div className="max-w-2xl mx-auto">
          <div
            className="border-2 border-foreground bg-card p-4 mb-8"
            style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
          >
            <h2 className="text-xl font-bold mb-2">WHAT IS THIS?</h2>
            <p className="text-base">
              Snow Bunnies is a ski trip planner. Low commitment, easy access to
              information. Plan your trip without the hassle. No sign-ups, no
              accounts—just works.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border-2 border-foreground bg-card p-4"
                style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
              >
                <h3 className="font-bold text-base mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div
            className="border-2 border-foreground bg-card p-4 mt-8"
            style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
          >
            <p className="text-sm text-muted-foreground">
              Ready to plan your trip? Head back and create your first one.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
