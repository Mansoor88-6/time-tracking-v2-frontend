import { cn } from "@/utils/tw";
import { CircularProgress } from "../CircularProgress/CircularProgress";

interface StatCardProps {
  label: string;
  value: string | number;
  valueSuffix?: string; // e.g. "AM", "%", "h"
  subtitle?: string;
  helperText?: string; // optional extra line for special cases
  progress?: number;
  progressColor?: "teal" | "coral" | "yellow" | "navy" | "pink";
  className?: string;
}

export function StatCard({
  label,
  value,
  valueSuffix,
  subtitle = "PER DAY",
  helperText,
  progress,
  progressColor = "pink",
  className,
}: StatCardProps) {
  const hasProgress = progress !== undefined;

  const valueColorClass = (() => {
    // Light mode:
    // - Default: green-ish for time/duration/etc.
    // - Percent cards: color depends on the progress value.
    if (!hasProgress) return "text-emerald-700";

    const p = Math.max(0, Math.min(100, progress ?? 0));
    if (p < 40) return "text-red-600";
    if (p < 70) return "text-amber-600";
    return "text-emerald-700";
  })();

  return (
    <div
      className={cn(
        "flex items-center p-6 rounded-2xl bg-stat stat-card-hover card-shadow-lg",
        hasProgress ? "justify-between" : "flex-col justify-center text-center",
        className
      )}
    >
      <div className={cn("space-y-1", hasProgress ? "" : "w-full")}>
        <p className="text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-400 uppercase">
          {label}
        </p>
        <div
          className={cn(
            "font-medium dark:text-gray-50",
            valueColorClass,
            hasProgress ? "text-3xl" : "text-4xl md:text-5xl"
          )}
        >
          <span className="inline-flex items-center">
            <span>{value}</span>
            {valueSuffix ? (
              <span className="ml-2 text-base md:text-lg font-semibold text-current/80 dark:text-gray-300">
                {valueSuffix}
              </span>
            ) : null}
          </span>
        </div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase">
          {subtitle}
        </p>
        {helperText ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        ) : null}
      </div>
      {hasProgress && (
        <CircularProgress value={progress} color={progressColor} size={70} />
      )}
    </div>
  );
}
