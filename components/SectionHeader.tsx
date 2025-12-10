import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-2 flex items-center gap-2", className)}>
      <span className="bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-mono">
        {children}
      </span>
    </div>
  );
}
