"use client";

import { Period } from "@/utils/dateRange";

interface PeriodSelectorProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  disabled?: boolean;
}

/**
 * Period Selector Component
 * 
 * Segmented control for selecting Day/Week/Month view
 * Matches DeskTime's green highlight style
 */
export function PeriodSelector({ period, onPeriodChange, disabled = false }: PeriodSelectorProps) {
  const periods: { value: Period; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  return (
    <div className={`inline-flex rounded-md bg-slate-100 dark:bg-slate-800 p-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} role="group">
      {periods.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => !disabled && onPeriodChange(p.value)}
          disabled={disabled}
          className={`
            px-4 py-1.5 text-sm font-medium rounded transition-all
            ${
              disabled
                ? 'cursor-not-allowed opacity-50'
                : period === p.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
            }
          `}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
