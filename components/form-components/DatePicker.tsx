import { format, isBefore, isValid, parseISO } from "date-fns";
import { Calendar } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface iDatePickerProps {
  value: Date | Date[] | null;
  onChange: (date: Date | Date[] | null) => void;
  textLabel: string;
  className?: string;
  minDate?: Date;
  mode?: "single" | "multiple";
}

export const DatePickerInput: React.FC<iDatePickerProps> = ({
  value,
  onChange,
  textLabel,
  className,
  minDate,
  mode = "single",
}) => {
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const datepickerRef = useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = useState<string | string[]>("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const toggleCalendar = () => {
    setShowCalendar((prevShowCalendar) => !prevShowCalendar);
  };

  const handleDayClick = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return;
    onChange(date);
    setShowCalendar(false);
  };

  const handleDayRangeClick = (selected: (Date | string)[] | undefined) => {
    if (!selected) return;

    const parsedDates: Date[] = selected.map((d) =>
      typeof d === "string" ? parseISO(d) : d
    );

    onChange(parsedDates);
    setSelectedDates(parsedDates);
  };

  useEffect(() => {
    if (mode === "multiple" && Array.isArray(value)) {
      setSelectedDates(value);
    }
  }, [value]);

  useEffect(() => {
    if (mode === "multiple" && Array.isArray(value)) {
      const formatted = value
        .filter((d) => isValid(d))
        .map((d) => format(d, "dd-MM-yyyy"))
        .join(", ");
      setInputValue(formatted);
    } else if (value && isValid(value as Date)) {
      setInputValue(format(value as Date, "dd-MM-yyyy"));
    } else {
      setInputValue("");
    }
  }, [value]);

  return (
    <div className={`relative max-w-xl ${className}`}>
      <Popover open={showCalendar} onOpenChange={toggleCalendar} modal={true}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              readOnly
              placeholder={textLabel}
              value={inputValue}
              className="w-full pr-10 border border-[#ADADAD] rounded-lg"
            />
            <div className="absolute inset-y-0 right-2 flex items-center cursor-pointer">
              <Calendar width={15} />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0 z-50">
          <div
            ref={datepickerRef}
            className="bg-white shadow-lg rounded-md p-2 border"
          >
            {mode === "multiple" ? (
              <>
                <DayPicker
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => {
                    handleDayRangeClick(dates);
                  }}
                  disabled={minDate ? { before: minDate } : undefined}
                />
              </>
            ) : (
              <>
                <DayPicker
                  defaultMonth={
                    value && (value instanceof Date || !Array.isArray(value))
                      ? new Date(value)
                      : undefined
                  }
                  selected={
                    value && (value instanceof Date || !Array.isArray(value))
                      ? new Date(value)
                      : undefined
                  }
                  onDayClick={handleDayClick}
                  disabled={minDate ? { before: minDate } : undefined}
                  showOutsideDays
                  fixedWeeks
                />
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
