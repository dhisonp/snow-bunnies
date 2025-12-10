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
    title: "The Local in Your Pocket",
    description:
      "AI that reads the forums so you don't have to. We scour the corners of the internet for the real alpha—which runs are groomed, where the snow holds up, and which lodge has the best chili. No marketing fluff.",
  },
  {
    title: "Zero-Friction Tracking",
    description:
      "Your friends are lazy. We get it. That's why there's no login, no download, and no 'create an account to view'. Send them a link, and they're in. It just works.",
  },
  {
    title: "Lift Line Radar",
    description:
      "Nothing ruins a powder day like a 45-minute lift line. Our crowd predictions warn you before you commit, so you can dodge the masses and lap the empty chairs.",
  },
  {
    title: "Weather That Doesn't Lie",
    description:
      "16-day forecasts with historical truth-serum. If it's gonna be an ice rink, we'll tell you. We'd rather you stay home than ski bad snow.",
  },
  {
    title: "Why You Need This",
    description:
      "Because you're the one planning the trip, and you deserve to actually enjoy it. Look like a genius, ski better snow, and never get stuck in a 'where should we go?' loop again.",
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
            <h2 className="text-xl font-bold mb-2">YOUR GROUP CHAT'S MVP.</h2>
            <p className="text-base">
              Let's be real: planning a ski trip is usually a nightmare of
              opened tabs, conflicting weather apps, and "I heard from a guy"
              rumors. Snow Bunnies kills the noise. We track the stuff that
              actually matters—weather, crowds, and local secrets—so you can
              stop guessing and start shredding.
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
              Stop checking 5 different apps. Start tracking.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
