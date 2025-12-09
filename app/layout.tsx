import type { Metadata } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { UnitsProvider } from "@/components/TemperatureContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PasswordProtection } from "@/components/PasswordProtection";

const recursive = Recursive({
  subsets: ["latin"],
  variable: "--font-recursive",
});

export const metadata: Metadata = {
  title: "Snow Bunnies",
  description: "Ski Trips Made Easier, Cooler",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased font-medium",
          recursive.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UnitsProvider>{children}</UnitsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
