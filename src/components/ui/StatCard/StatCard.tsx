import { cn } from "@/utils/tw";
import { CircularProgress } from "../CircularProgress/CircularProgress";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  progress?: number;
  progressColor?: "teal" | "coral" | "yellow" | "navy";
  className?: string;
}

export function StatCard({
  label,
  value,
  subtitle = "PER DAY",
  progress,
  progressColor = "teal",
  className,
}: StatCardProps) {
  const hasProgress = progress !== undefined;

  return (
    <div
      className={cn(
        "flex items-center p-6 rounded-2xl bg-stat stat-card-hover card-shadow-lg",
        hasProgress ? "justify-between" : "flex-col justify-center text-center",
        className
      )}
    >
      <div className={cn("space-y-1", hasProgress ? "" : "w-full")}>
        <p className="text-xs font-medium tracking-wider text-stat-foreground/60 uppercase">
          {label}
        </p>
        <p
          className={cn(
            "font-bold text-stat-foreground",
            hasProgress ? "text-3xl" : "text-4xl md:text-5xl"
          )}
        >
          {value}
        </p>
        <p className="text-xs font-medium text-stat-foreground/50 uppercase">
          {subtitle}
        </p>
      </div>
      {hasProgress && (
        <CircularProgress value={progress} color={progressColor} size={70} />
      )}
    </div>
  );
}
