import { apiClient } from "@/lib/apiClient";

export type WageCurrencyCode = "PKR" | "USD";

export type WageSummaryResponse =
  | { configured: false }
  | {
      configured: true;
      currency: WageCurrencyCode;
      dailyWorkingHours: number;
      monthlyWage: number;
      startDate: string;
      endDate: string;
      workdaysInPeriod: number;
      productiveTimeMs: number;
      productiveHours: number;
      hourlyRate: number;
      accumulatedWage: number;
      progressTowardMonthlyPct: number;
    };

export async function fetchWageSummary(params: {
  startDate: string;
  endDate: string;
  timezone?: string;
  /** Admin user-view: load summary for this user id */
  viewAsUserId?: number;
}): Promise<WageSummaryResponse> {
  const q = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });
  if (params.timezone) q.set("tz", params.timezone);
  if (params.viewAsUserId != null)
    q.set("userId", String(params.viewAsUserId));
  return apiClient<WageSummaryResponse>(
    `/api/v1/dashboard/wage-summary?${q.toString()}`
  );
}

export function formatWageAmount(amount: number, currency: WageCurrencyCode): string {
  try {
    return new Intl.NumberFormat(currency === "PKR" ? "en-PK" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
