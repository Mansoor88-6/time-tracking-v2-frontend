import { cn } from "@/utils/tw";
import { CircularProgress } from "../CircularProgress/CircularProgress";
import { getProgressValueColor } from "@/theme/utils";
import { BiInfoCircle } from "react-icons/bi";

interface StatCardProps {
  label: string;
  value: string | number;
  valueSuffix?: string; // e.g. "AM", "%", "h"
  subtitle?: string;
  helperText?: string; // optional extra line for special cases
  /** Shown next to an info icon; hover/focus reveals the explanation. */
  infoTooltip?: string;
  progress?: number;
  progressColor?: "teal" | "coral" | "yellow" | "navy" | "pink";
  className?: string;
}

function StatCardInfoHint({ text }: { text: string }) {
  return (
    <span className="relative inline-flex shrink-0 group/info">
      <button
        type="button"
        className="rounded-full p-0.5 text-gray-400 outline-none transition-colors hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500/80"
        aria-label="What this metric means"
      >
        <BiInfoCircle className="h-4 w-4" aria-hidden />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-56 max-w-[min(16rem,calc(100vw-2rem))] rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs font-normal normal-case leading-snug tracking-normal text-gray-900 shadow-lg opacity-0 transition-opacity invisible group-hover/info:opacity-100 group-hover/info:visible group-focus-within/info:opacity-100 group-focus-within/info:visible"
      >
        {text}
      </span>
    </span>
  );
}

export function StatCard({
  label,
  value,
  valueSuffix,
  subtitle = "PER DAY",
  helperText,
  infoTooltip,
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
    return getProgressValueColor(progress ?? 0);
  })();

  return (
    <div
      className={cn(
        "relative flex items-center p-6 rounded-2xl bg-stat stat-card-hover card-shadow-lg",
        hasProgress ? "justify-between" : "flex-col justify-center text-center",
        className
      )}
    >
      {infoTooltip && !hasProgress ? (
        <div className="absolute top-4 right-4 z-10">
          <StatCardInfoHint text={infoTooltip} />
        </div>
      ) : null}
      <div className={cn("space-y-1", hasProgress ? "min-w-0 flex-1" : "w-full")}>
        <div
          className={cn(
            "flex items-start gap-2",
            hasProgress ? "justify-between" : "justify-center"
          )}
        >
          <p
            className={cn(
              "text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-400 uppercase",
              hasProgress ? "min-w-0 flex-1" : "",
              !hasProgress && infoTooltip ? "pr-8" : ""
            )}
          >
            {label}
          </p>
          {infoTooltip && hasProgress ? (
            <StatCardInfoHint text={infoTooltip} />
          ) : null}
        </div>
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
