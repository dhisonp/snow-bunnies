import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeadingProps {
  children: ReactNode;
  className?: string;
  variant?: "h1" | "h2" | "h3" | "h4";
}

interface TextProps {
  children: ReactNode;
  className?: string;
  variant?: "body" | "caption" | "mono";
}

export function Heading({ children, className, variant = "h3" }: HeadingProps) {
  const baseClasses = "font-mono font-bold uppercase tracking-tight";

  const variantClasses = {
    h1: "text-xl",
    h2: "text-lg",
    h3: "text-sm",
    h4: "text-xs",
  };

  const Component = variant;

  return (
    <Component className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </Component>
  );
}

export function Text({ children, className, variant = "body" }: TextProps) {
  const variantClasses = {
    body: "text-sm",
    caption: "text-xs",
    mono: "text-sm font-mono",
  };

  return <p className={cn(variantClasses[variant], className)}>{children}</p>;
}
