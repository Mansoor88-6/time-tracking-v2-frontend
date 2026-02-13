"use client";

import { useState } from "react";
import { cn } from "@/utils/tw";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { FiGlobe } from "react-icons/fi";
import { AppUsageTooltip } from "../AppUsageTooltip/AppUsageTooltip";
import type { UrlBreakdown } from "@/services/appUsage";
import { getCategoryStylesUtil } from "@/theme/utils";

export interface AppUsageItem {
  id: string;
  name: string;
  icon?: React.ReactNode;
  timeSpent: string; // e.g., "1h 58m", "25m", "14s"
  urlBreakdown?: UrlBreakdown[]; // Breakdown by URL/title
}

interface AppUsageSectionProps {
  title: string;
  totalTime?: string; // e.g., "3h 35m"
  apps: AppUsageItem[];
  category: "productive" | "unproductive" | "neutral";
  defaultExpanded?: boolean;
  className?: string;
}

// Default icon component for apps without custom icons
const DefaultAppIcon = ({ className }: { className?: string }) => (
  <FiGlobe className={cn("w-5 h-5 text-gray-600 dark:text-gray-400", className)} />
);

export function AppUsageSection({
  title,
  totalTime,
  apps,
  category,
  defaultExpanded = true,
  className,
}: AppUsageSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const categoryStyles = getCategoryStylesUtil(category);
  const styles = {
    headerBg: categoryStyles.bg,
    headerText: categoryStyles.text,
    border: categoryStyles.border,
    borderAccent: categoryStyles.accent || "",
    bg: categoryStyles.bg,
  };

  const formatTime = (time: string) => {
    // Ensure consistent formatting
    return time;
  };

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden transition-all duration-200",
        styles.border,
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full px-4 py-3 flex items-center justify-between",
          "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
          styles.headerBg,
          styles.headerText,
          styles.borderAccent
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm uppercase tracking-wide">
            {title}
            {totalTime && ` - ${totalTime}`}
          </span>
        </div>
        {isExpanded ? (
          <MdExpandLess className="w-5 h-5" />
        ) : (
          <MdExpandMore className="w-5 h-5" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className={cn("p-4", styles.bg)}>
          {apps.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No data collected</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {apps.map((app) => (
                <AppUsageTooltip
                  key={app.id}
                  appName={app.name}
                  totalTime={app.timeSpent}
                  urlBreakdown={app.urlBreakdown || []}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg",
                      "bg-white dark:bg-gray-800",
                      "border border-gray-200 dark:border-gray-700",
                      "hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/50",
                      "hover:border-gray-300 dark:hover:border-gray-600",
                      "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                      "transition-all duration-200",
                      app.urlBreakdown && app.urlBreakdown.length > 0
                        ? "cursor-help"
                        : ""
                    )}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {app.icon || <DefaultAppIcon />}
                    </div>

                    {/* App Name and Time */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {app.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(app.timeSpent)}
                      </p>
                    </div>
                  </div>
                </AppUsageTooltip>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
