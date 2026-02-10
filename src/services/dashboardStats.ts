import { apiClient } from "@/lib/apiClient";

/**
 * Dashboard Stats Response Interface
 * Matches the response from the backend/worker service
 */
export interface DashboardStatsResponse {
  arrivalTime: string | null; // ISO date string
  leftTime: string | null; // ISO date string, or null if online
  isOnline: boolean;
  productiveTimeMs: number;
  deskTimeMs: number;
  timeAtWorkMs: number;
  productivityScorePct: number;
  effectivenessPct: number;
  projectsTimeMs: number;
}

/**
 * Format milliseconds to human-readable duration
 * Examples: "36s", "10m", "3h 24m", "1h 5m"
 */
export function formatDuration(ms: number): string {
  if (ms < 0) return "0s";
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // If less than 1 minute, show seconds
  if (hours === 0 && minutes === 0) {
    return `${seconds}s`;
  }
  
  // If less than 1 hour, show minutes only
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  // If hours but no minutes, show hours only
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  // Show hours and minutes
  return `${hours}h ${minutes}m`;
}

/**
 * Format a date to time string with AM/PM
 * Returns { time: "11:10", suffix: "AM" }
 */
export function formatTimeWithSuffix(date: Date | string | null): {
  time: string;
  suffix: string;
} | null {
  if (!date) return null;
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return null;
  
  const hours = d.getHours();
  const minutes = d.getMinutes();
  
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const suffix = hours >= 12 ? "PM" : "AM";
  const timeStr = `${hour12}:${String(minutes).padStart(2, "0")}`;
  
  return { time: timeStr, suffix };
}

/**
 * Fetch dashboard stats from the backend
 */
export async function fetchDashboardStats(
  date?: string,
  timezone?: string
): Promise<DashboardStatsResponse> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (timezone) params.append("tz", timezone);
  
  const queryString = params.toString();
  const url = `/api/v1/dashboard/stats${queryString ? `?${queryString}` : ""}`;
  
  return apiClient<DashboardStatsResponse>(url);
}

/**
 * Organization Dashboard Stats Response Interface
 */
export interface OrganizationDashboardStatsResponse {
  aggregated: {
    totalProductiveTimeMs: number;
    totalDeskTimeMs: number;
    totalTimeAtWorkMs: number;
    totalProjectsTimeMs: number;
    averageProductivityScore: number;
    averageEffectiveness: number;
    totalUsers: number;
    activeUsers: number;
  };
  users: Array<{
    userId: number;
    userName: string;
    userEmail: string;
    stats: DashboardStatsResponse;
  }>;
}

/**
 * Fetch organization dashboard stats from the backend
 */
export async function fetchOrganizationDashboardStats(
  filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
    timezone?: string;
    userIds?: number[];
    teamIds?: number[];
  }
): Promise<OrganizationDashboardStatsResponse> {
  const params = new URLSearchParams();
  if (filters.date) params.append("date", filters.date);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.timezone) params.append("tz", filters.timezone);
  if (filters.userIds && filters.userIds.length > 0) {
    filters.userIds.forEach((id) => params.append("userId", id.toString()));
  }
  if (filters.teamIds && filters.teamIds.length > 0) {
    filters.teamIds.forEach((id) => params.append("teamId", id.toString()));
  }
  
  const queryString = params.toString();
  const url = `/api/v1/dashboard/organization/stats${queryString ? `?${queryString}` : ""}`;
  
  return apiClient<OrganizationDashboardStatsResponse>(url);
}