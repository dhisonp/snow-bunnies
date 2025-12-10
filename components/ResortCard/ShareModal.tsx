"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Check, Copy } from "lucide-react";
import { encodeTrip } from "@/lib/storage";
import { type TripConfig } from "@/lib/types/trip";
import { type Resort } from "@/lib/types/resort";

interface ShareModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  trip: TripConfig;
  resort: Resort;
}

export function ShareModal({ isOpen, onClose, trip, resort }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}?trip=${encodeTrip(trip)}`
      : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-none border-4 border-primary bg-background shadow-[8px_8px_0px_0px_var(--foreground)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-tight text-xl">
            <Share2 className="h-5 w-5 text-primary" />
            Share Trip
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm">
            Send this link to a friend so they can view your{" "}
            <span className="font-bold">{resort.name}</span> trip details.
          </p>
          <div className="space-y-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-xs rounded-none border-2 border-primary"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              onClick={handleCopy}
              className="w-full rounded-none font-bold uppercase"
              variant={copied ? "default" : "outline"}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
