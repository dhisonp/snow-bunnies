import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarPlus } from "lucide-react";

interface PredictionModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

export function PredictionModal({ isOpen, onClose }: PredictionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-none border-4 border-primary bg-background shadow-[8px_8px_0px_0px_var(--foreground)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-tight text-xl">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Come Back Later
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm leading-relaxed">
            Trip Briefs rely on live weather patterns and crowd tracking to give
            you accurate, actionable advice.
          </p>
          <p className="text-sm font-medium border-l-4 border-primary pl-3 py-1 bg-muted">
            Please return when your trip is within{" "}
            <span className="text-primary font-bold">16 days</span> for a full
            report.
          </p>
          <Button
            onClick={() => onClose(false)}
            className="w-full rounded-none font-bold uppercase"
          >
            Understood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
