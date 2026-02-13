import { cn } from "@/utils/tw";
import { getChartColorClassUtil } from "@/theme/utils";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: "teal" | "coral" | "yellow" | "navy" | "pink";
  className?: string;
  showValue?: boolean;
}

export function CircularProgress({
  value,
  size = 60,
  strokeWidth = 6,
  color = "pink",
  className,
  showValue = true,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="progress-ring">
        {/* Progress circle - only visible arc, no background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("progress-ring__circle", getChartColorClassUtil(color))}
        />
      </svg>
      {showValue && (
        <span className="absolute text-xs font-bold text-gray-900 dark:text-gray-50 tracking-tight leading-none">
          {value}%
        </span>
      )}
    </div>
  );
}
