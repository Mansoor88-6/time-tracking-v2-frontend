"use client";

import { useState, useEffect } from "react";
import { BiCalendar, BiX } from "react-icons/bi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/DropdownMenu/DropdownMenu";

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (startDate: string | undefined, endDate: string | undefined) => void;
}

/**
 * Date Range Picker Component
 * 
 * Allows users to select a custom date range via calendar inputs
 */
export function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(startDate || "");
  const [localEndDate, setLocalEndDate] = useState(endDate || "");

  // Sync local state with props when they change externally
  useEffect(() => {
    setLocalStartDate(startDate || "");
    setLocalEndDate(endDate || "");
  }, [startDate, endDate]);

  const hasCustomRange = startDate && endDate;

  const handleApply = () => {
    if (localStartDate && localEndDate) {
      // Validate that end date is after start date
      if (new Date(localEndDate) >= new Date(localStartDate)) {
        onDateRangeChange(localStartDate, localEndDate);
        setIsOpen(false);
      }
    } else if (!localStartDate && !localEndDate) {
      // Clear custom range
      onDateRangeChange(undefined, undefined);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    onDateRangeChange(undefined, undefined);
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return "Custom Range";
    const start = new Date(startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`
            p-2.5 rounded-md transition-colors
            ${
              hasCustomRange
                ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            }
          `}
          aria-label={hasCustomRange ? `Custom range: ${formatDateRange()}` : "Select custom date range"}
          title={hasCustomRange ? `Custom range: ${formatDateRange()}` : "Select custom date range"}
        >
          <BiCalendar className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[320px] p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Select Date Range
            </h3>
            {hasCustomRange && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Clear date range"
              >
                <BiX className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="start-date"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                max={localEndDate || undefined}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="end-date"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                min={localStartDate || undefined}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {localStartDate && localEndDate && new Date(localEndDate) < new Date(localStartDate) && (
            <p className="text-xs text-red-600 dark:text-red-400">
              End date must be after start date
            </p>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleApply}
              disabled={
                !localStartDate ||
                !localEndDate ||
                new Date(localEndDate) < new Date(localStartDate)
              }
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
