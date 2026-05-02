import { apiClient } from "@/lib/apiClient";

export type OfflineTimeCategory = "productive" | "neutral" | "unproductive";

export type OfflineTimeRequestStatus = "pending" | "approved" | "declined";

export interface OfflineTimeRequestDto {
  id: number;
  tenantId: number;
  userId: number;
  startAt: string;
  endAt: string;
  description: string;
  category: OfflineTimeCategory;
  /** Present when created as part of one multi-segment submit from the timeline. */
  submitBatchId?: string | null;
  status: OfflineTimeRequestStatus;
  reviewedByUserId: number | null;
  reviewedAt: string | null;
  declineReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createOfflineTimeRequest(body: {
  startAt: string;
  endAt: string;
  description: string;
  category: OfflineTimeCategory;
  submitBatchId?: string;
}): Promise<OfflineTimeRequestDto> {
  return apiClient<OfflineTimeRequestDto>("/api/v1/offline-time-requests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listMyOfflineTimeRequests(
  status?: OfflineTimeRequestStatus
): Promise<OfflineTimeRequestDto[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiClient<OfflineTimeRequestDto[]>(
    `/api/v1/offline-time-requests${q}`
  );
}

export async function listPendingOfflineTimeRequests(): Promise<
  OfflineTimeRequestDto[]
> {
  return listPendingOfflineTimeRequestsForAdmin();
}

export async function listPendingOfflineTimeRequestsForAdmin(filters?: {
  userId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<OfflineTimeRequestDto[]> {
  const params = new URLSearchParams();
  if (filters?.userId) params.set("userId", String(filters.userId));
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  const q = params.toString();
  return apiClient<OfflineTimeRequestDto[]>(
    `/api/v1/offline-time-requests/pending${q ? `?${q}` : ""}`
  );
}

export async function approveOfflineTimeRequest(
  id: number
): Promise<OfflineTimeRequestDto> {
  return apiClient<OfflineTimeRequestDto>(
    `/api/v1/offline-time-requests/${id}/approve`,
    { method: "POST" }
  );
}

export async function declineOfflineTimeRequest(
  id: number,
  reason?: string
): Promise<OfflineTimeRequestDto> {
  return apiClient<OfflineTimeRequestDto>(
    `/api/v1/offline-time-requests/${id}/decline`,
    {
      method: "POST",
      body: JSON.stringify({ reason: reason ?? "" }),
    }
  );
}
