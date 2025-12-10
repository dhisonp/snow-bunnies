import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { type Resort } from "@/lib/types/resort";
import { type TripConfig } from "@/lib/types/trip";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";

interface ResortCardHeaderProps {
  trip: TripConfig;
  resort: Resort;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDateForICS(dateStr: string, addDays = 0): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (addDays) {
    date.setDate(date.getDate() + addDays);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function ResortCardHeader({
  trip,
  resort,
  onEdit,
  onDelete,
}: ResortCardHeaderProps) {
  const handleAddToCalendar = () => {
    const start = formatDateForICS(trip.dateRange.start);
    const end = formatDateForICS(trip.dateRange.end, 1); // ICS end date is exclusive

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:Ski Trip to ${resort.name}`,
      `DESCRIPTION:Skiing at ${resort.name} in ${resort.region}, ${resort.state}.`,
      `LOCATION:${resort.name}, ${resort.state}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ski-trip.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
      <div>
        <CardTitle className="text-xl">{resort.name}</CardTitle>
        <div className="text-sm text-muted-foreground">
          {resort.region}, {resort.state}
        </div>
        <div className="text-sm font-medium mt-1">
          {trip.dateRange.start} - {trip.dateRange.end}
        </div>
        <div className="text-sm font-bold capitalize">
          {trip.userProfile.skillLevel} {trip.userProfile.discipline}
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddToCalendar}
          title="Add to Apple Calendar"
        >
          <CalendarPlus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
}
