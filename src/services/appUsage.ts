import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import { formatDuration } from "./dashboardStats";

/**
 * URL/Title breakdown for an app
 * Shows time spent on different URLs or window titles within an application
 */
export interface UrlBreakdown {
  title: string | null; // Page title or null
  url: string | null; // Full URL or null
  displayName: string; // Formatted display name (title or URL domain)
  productiveTimeMs: number;
}

/**
 * App Usage Response Interface
 * Matches the response from the backend/worker service
 */
export interface AppUsage {
  appName: string;
  appType: "desktop" | "web";
  productiveTimeMs: number;
  category: "productive" | "unproductive" | "neutral";
  urlBreakdown: UrlBreakdown[]; // Breakdown by URL/title
}

export interface AppUsageStatsResponse {
  productive: AppUsage[];
  unproductive: AppUsage[];
  neutral: AppUsage[];
  totals: {
    productive: number; // Total productive time in ms
    unproductive: number; // Total unproductive time in ms
    neutral: number; // Total neutral time in ms
  };
}

/**
 * Fetch app usage stats from the backend
 */
export async function fetchAppUsageStats(
  date?: string,
  timezone?: string
): Promise<AppUsageStatsResponse> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (timezone) params.append("tz", timezone);

  const queryString = params.toString();
  const url = `/api/v1/dashboard/app-usage${queryString ? `?${queryString}` : ""}`;

  return apiClient<AppUsageStatsResponse>(url);
}

/**
 * React hook to fetch app usage stats
 * Auto-refreshes every 30 seconds
 */
export function useAppUsageStats(date?: string, timezone?: string) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const targetDate = date || today;

  return useQuery<AppUsageStatsResponse, Error>({
    queryKey: ["appUsageStats", targetDate, userTimezone],
    queryFn: () => fetchAppUsageStats(targetDate, userTimezone),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Data is considered fresh for 20 seconds
  });
}

/**
 * Format total time for a category
 */
export function formatCategoryTotal(ms: number): string {
  return formatDuration(ms);
}
