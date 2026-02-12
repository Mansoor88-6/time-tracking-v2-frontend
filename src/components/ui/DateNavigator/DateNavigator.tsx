"use client";

import { BiCalendar, BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { Period, formatPeriodDate, navigatePeriod } from "@/utils/dateRange";

interface DateNavigatorProps {
  currentDate: Date;
  period: Period;
  onDateChange: (date: Date) => void;
  onDatePickerClick?: () => void;
  disabled?: boolean;
}

/**
 * Date Navigator Component
 * 
 * Displays current date/period with previous/next navigation
 * Matches DeskTime's date navigation style
 */
export function DateNavigator({
  currentDate,
  period,
  onDateChange,
  onDatePickerClick,
  disabled = false,
}: DateNavigatorProps) {
  const handlePrev = () => {
    if (disabled) return;
    const newDate = navigatePeriod(currentDate, period, 'prev');
    onDateChange(newDate);
  };

  const handleNext = () => {
    if (disabled) return;
    const newDate = navigatePeriod(currentDate, period, 'next');
    onDateChange(newDate);
  };

  const formattedDate = formatPeriodDate(currentDate, period);

  return (
    <div className={`flex items-center gap-2 ${disabled ? 'opacity-50' : ''}`}>
      {/* Previous Button */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={disabled}
        className={`p-1.5 rounded-md transition-colors ${
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
        aria-label="Previous period"
      >
        <BiChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>

      {/* Date Display */}
      <div className="flex items-center gap-2">
        {onDatePickerClick && (
          <button
            type="button"
            onClick={onDatePickerClick}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Open date picker"
          >
            <BiCalendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        )}
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 min-w-[180px] text-center">
          {formattedDate}
        </span>
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={disabled}
        className={`p-1.5 rounded-md transition-colors ${
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
        aria-label="Next period"
      >
        <BiChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>
    </div>
  );
}
