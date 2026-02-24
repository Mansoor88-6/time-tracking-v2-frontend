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

export interface AppUsageStatsParams {
  date?: string;
  timezone?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch app usage stats from the backend
 * Use date for a single day, or startDate+endDate for a range (same as dashboard stats).
 */
export async function fetchAppUsageStats(
  params: AppUsageStatsParams
): Promise<AppUsageStatsResponse> {
  const { date, timezone, startDate, endDate } = params;
  const searchParams = new URLSearchParams();
  const useRange = !!startDate && !!endDate;
  if (useRange) {
    searchParams.append("startDate", startDate!);
    searchParams.append("endDate", endDate!);
  } else if (date) {
    searchParams.append("date", date);
  }
  if (timezone) searchParams.append("tz", timezone);

  const queryString = searchParams.toString();
  const url = `/api/v1/dashboard/app-usage${queryString ? `?${queryString}` : ""}`;

  return apiClient<AppUsageStatsResponse>(url);
}

/**
 * React hook to fetch app usage stats aligned with dashboard filters
 * Pass the same date/range as dashboard stats (date for day, startDate+endDate for week/month).
 * Auto-refreshes every 30 seconds
 */
export function useAppUsageStats(params: AppUsageStatsParams) {
  const today = new Date().toISOString().split("T")[0];
  const {
    date = today,
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
    startDate,
    endDate,
  } = params;
  const useRange = !!startDate && !!endDate;

  return useQuery<AppUsageStatsResponse, Error>({
    queryKey: ["appUsageStats", date, startDate, endDate, timezone],
    queryFn: () =>
      fetchAppUsageStats({
        date: useRange ? undefined : date,
        timezone,
        startDate,
        endDate,
      }),
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

/**
 * Format total time for a category
 */
export function formatCategoryTotal(ms: number): string {
  return formatDuration(ms);
}
