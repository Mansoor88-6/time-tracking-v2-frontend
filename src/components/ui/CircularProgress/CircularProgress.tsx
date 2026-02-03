import { cn } from "@/utils/tw";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: "teal" | "coral" | "yellow" | "navy";
  className?: string;
  showValue?: boolean;
}

const colorMap = {
  teal: "stroke-chart-teal",
  coral: "stroke-chart-coral",
  yellow: "stroke-chart-yellow",
  navy: "stroke-chart-navy",
};

export function CircularProgress({
  value,
  size = 60,
  strokeWidth = 6,
  color = "teal",
  className,
  showValue = true,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="progress-ring">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("progress-ring__circle", colorMap[color])}
        />
      </svg>
      {showValue && (
        <span className="absolute text-xs font-semibold text-stat-foreground">
          {value}%
        </span>
      )}
    </div>
  );
}
