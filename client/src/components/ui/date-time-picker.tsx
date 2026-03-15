import * as React from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " at " + date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function DateTimePicker({ date, setDate, disabled }: DateTimePickerProps) {
  const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(date);

  React.useEffect(() => {
    setSelectedDateTime(date);
  }, [date]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDateTime = selectedDateTime ? new Date(selectedDateTime) : new Date();
      newDateTime.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setSelectedDateTime(newDateTime);
      setDate(newDateTime);
    } else {
      setSelectedDateTime(undefined);
      setDate(undefined);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    const newDateTime = selectedDateTime ? new Date(selectedDateTime) : new Date();
    if (type === "hour") {
      newDateTime.setHours(parseInt(value, 10));
    } else {
      newDateTime.setMinutes(parseInt(value, 10));
    }
    setSelectedDateTime(newDateTime);
    setDate(newDateTime);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-auto py-3.5 px-4 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white",
            !selectedDateTime && "text-white/40"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-3 h-5 w-5 text-indigo-400 shrink-0" />
          {selectedDateTime ? (
            formatDateTime(selectedDateTime)
          ) : (
            <span>Pick a date & time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-[#0d0f1a] border-white/10 rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-2xl overflow-hidden"
        align="start"
      >
        <div className="p-4 pb-2">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            startMonth={new Date()}
            endMonth={new Date(2035, 11)}
            selected={selectedDateTime}
            onSelect={handleSelect}
            initialFocus
          />
        </div>

        {/* Time Picker Row */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-white/10 bg-white/[0.02]">
          <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="text-sm font-medium text-white/70">Time</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <select
              className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-center min-w-[56px]"
              value={selectedDateTime ? selectedDateTime.getHours().toString().padStart(2, "0") : "12"}
              onChange={(e) => handleTimeChange("hour", e.target.value)}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i.toString().padStart(2, "0")} className="bg-[#0d0f1a] text-white">
                  {i.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <span className="text-white/40 font-bold text-lg">:</span>
            <select
              className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-center min-w-[56px]"
              value={selectedDateTime ? selectedDateTime.getMinutes().toString().padStart(2, "0") : "00"}
              onChange={(e) => handleTimeChange("minute", e.target.value)}
            >
              {Array.from({ length: 60 }).map((_, i) => (
                <option key={i} value={i.toString().padStart(2, "0")} className="bg-[#0d0f1a] text-white">
                  {i.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
