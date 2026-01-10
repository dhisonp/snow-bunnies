"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type Resort } from "@/lib/types/resort";
import resortsData from "@/lib/data/resorts.json";

const resorts: Resort[] = resortsData as Resort[];

interface ResortPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ResortPicker({ value, onChange }: ResortPickerProps) {
  const [open, setOpen] = React.useState(false);
  const sortedResorts = React.useMemo(
    () =>
      [...resorts].sort(
        (a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name)
      ),
    []
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? resorts.find((resort) => resort.id === value)?.name
            : "Select resort..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-[500px] p-0">
        <Command>
          <CommandInput placeholder="Search resort..." />
          <CommandList>
            <CommandEmpty>No resort found.</CommandEmpty>
            <CommandGroup>
              {sortedResorts.map((resort) => (
                <CommandItem
                  key={resort.id}
                  value={resort.id}
                  className="flex items-center"
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === resort.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{resort.name}</span>
                  <span className="ml-auto text-sm font-medium">
                    {resort.region}, {resort.state}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
