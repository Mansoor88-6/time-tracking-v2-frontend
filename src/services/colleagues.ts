import { apiClient } from "@/lib/apiClient";

export interface ColleagueDto {
  id: number;
  name: string | null;
  displayName: string | null;
  email: string;
  teams: { id: number; name: string }[];
  teamLabel: string;
  isOnline: boolean;
  lastActivityAt: string | null;
  avatarInitial: string;
}

export interface ColleaguesResponse {
  windowSec: number;
  colleagues: ColleagueDto[];
}

/**
 * Tenant roster with online status (from recent tracking events). End-user accessible.
 * @param windowSec Consider online if last event within this many seconds (default 120).
 */
export async function fetchColleagues(
  windowSec: number = 120
): Promise<ColleaguesResponse> {
  const params = new URLSearchParams({ windowSec: String(windowSec) });
  return apiClient<ColleaguesResponse>(
    `/api/v1/dashboard/colleagues?${params.toString()}`
  );
}
