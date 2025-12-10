"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Github,
  Activity,
  BedDouble,
  MessageSquareText,
  Eye,
  CalendarDays,
  Mountain,
} from "lucide-react";

interface Feature {
  title: string;
  description: string;
  category: "Weather" | "Crowds" | "AI Insights" | "UX Polish" | "Resorts";
  icon: React.ElementType;
}

const upcomingFeatures: Feature[] = [
  {
    title: "The Vibe Check",
    description:
      "A single, brutal number that tells you if you should call in sick or stay at work. We crunch the snow, crowds, and vibes into one simple score.",
    category: "AI Insights",
    icon: Activity,
  },
  {
    title: "The Crash Pad Finder",
    description:
      "Because sleeping in your car is only fun until you're 25. AI-generated finds for where to crash, from 'dirtbag cheap' to 'boujee cabin'.",
    category: "AI Insights",
    icon: BedDouble,
  },
  {
    title: "Forum Diver",
    description:
      "We're teaching the AI to read the angry local forums so you don't have to. Real-time updates on which lifts are actually spinning and where the ice patches are hiding.",
    category: "AI Insights",
    icon: MessageSquareText,
  },
  {
    title: "Google's All-Seeing Eye",
    description:
      "Tapping into the matrix to see exactly how full the parking lot is right now. If there's a line for the bathroom, you'll know.",
    category: "Crowds",
    icon: Eye,
  },
  {
    title: "The Avoider's Almanac",
    description:
      "A full-season view of when the Jerry convention is in town. Plan your sick days around the empty slopes, not the holidays.",
    category: "Crowds",
    icon: CalendarDays,
  },
  {
    title: "Bring Your Own Resort",
    description:
      "Skiing somewhere obscure? We'll let you add that hidden gem in the backcountry that no one else knows about (yet).",
    category: "Resorts",
    icon: Mountain,
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
              We&apos;re just getting started. Here is the alpha we are cooking
              up in the lab. No promises on dates, but when they drop,
              they&apos;ll be game changers.
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
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 border-2 border-foreground bg-background">
                          <feature.icon className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <h3 className="font-bold text-base">{feature.title}</h3>
                      </div>
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
