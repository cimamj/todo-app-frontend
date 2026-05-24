"use client";

import * as React from "react";
import { Input } from "./input";

type DatePickerProps = React.InputHTMLAttributes<HTMLInputElement>;

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getCalendarGrid = (month: Date) => {
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const days: Date[] = [];
  const startOffset = firstWeekday === 0 ? 6 : firstWeekday - 1; // Monday-first week
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - startOffset);

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }

  return days;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </svg>
);

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, value, onChange, min, placeholder, ...props }, ref) => {
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const [open, setOpen] = React.useState(false);
    const [currentMonth, setCurrentMonth] = React.useState(() => {
      const selected = value ? parseDateValue(String(value)) : null;
      return selected ? new Date(selected) : new Date();
    });

    const selectedDate = value ? parseDateValue(String(value)) : null;
    const minDate = min ? parseDateValue(String(min)) : null;

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectDate = (date: Date) => {
      if (minDate && date < minDate) return;
      const formatted = formatDateValue(date);
      if (onChange) {
        const syntheticEvent = {
          target: { value: formatted },
          currentTarget: { value: formatted },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
      setOpen(false);
    };

    const days = getCalendarGrid(currentMonth);
    const monthLabel = currentMonth.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    return (
      <div ref={wrapperRef} className={`relative ${className ?? ""}`}>
        <Input
          ref={ref}
          type="text"
          value={value || ""}
          onChange={onChange}
          onFocus={() => {
            const nextMonth = selectedDate
              ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
              : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            setCurrentMonth(nextMonth);
            setOpen(true);
          }}
          placeholder={placeholder || "Select date"}
          className="w-full pr-10"
          {...props}
        />
        <button
          type="button"
          onClick={() => {
            if (!open) {
              const nextMonth = selectedDate
                ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
                : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
              setCurrentMonth(nextMonth);
            }
            setOpen((prev) => !prev);
          }}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
          aria-label="Toggle date picker"
        >
          <CalendarIcon />
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Previous month"
              >
                ‹
              </button>
              <div className="text-sm font-medium text-gray-900">{monthLabel}</div>
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-gray-500">
              {['Mo','Tu','We','Th','Fr','Sa','Su'].map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 pt-2 text-sm">
              {days.map((day) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const disabled = minDate ? day < minDate : false;
                const selected = selectedDate ? isSameDay(day, selectedDate) : false;
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    disabled={!isCurrentMonth || disabled}
                    className={`h-9 w-full rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      selected
                        ? "bg-blue-600 text-white"
                        : disabled
                        ? "text-gray-300"
                        : isCurrentMonth
                        ? "text-gray-900 hover:bg-gray-100"
                        : "text-gray-400"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-500">
              <span>Click a date to select.</span>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  if (minDate && today < minDate) return;
                  handleSelectDate(today);
                }}
                className="rounded-md px-2 py-1 text-blue-600 hover:bg-blue-50"
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
