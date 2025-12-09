"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function PasswordProtection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (!process.env.NEXT_PUBLIC_SITE_PASSWORD) {
      setIsAuthenticated(true);
      return;
    }

    const auth = localStorage.getItem("isAuthenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sitePassword = process.env.NEXT_PUBLIC_SITE_PASSWORD;

    if (!sitePassword || password === sitePassword) {
      localStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!isClient || isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card p-6 border-2 border-foreground shadow-[8px_8px_0px_0px_var(--foreground)] rounded-none">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 border-2 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] bg-background">
            <Lock className="h-8 w-8" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Access Required
            </h2>
            <p className="text-muted-foreground">
              Please enter the password to view this site.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`w-full rounded-none border-2 shadow-[2px_2px_0px_0px_var(--foreground)] focus-visible:ring-0 focus-visible:ring-offset-0 ${
                  error ? "border-red-500" : "border-foreground"
                }`}
              />
              {error && (
                <p className="text-xs font-medium text-red-500">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-none border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              Enter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
