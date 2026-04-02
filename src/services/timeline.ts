import { apiClient } from "@/lib/apiClient";
import type { TimeSlotData } from "@/components/ui/ProductivityTimeline";

export interface TimelineSlotResponse {
  startMinuteFromMidnight: number;
  slotStartUtc: string;
  productivePct: number;
  neutralPct: number;
  unproductivePct: number;
  idlePct: number;
  idleMs: number;
  online: boolean;
}

export interface TimelineParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  viewAsUserId?: number;
}

export async function fetchTimelineSlots(
  params: TimelineParams
): Promise<TimeSlotData[]> {
  const { date, startDate, endDate, timezone, viewAsUserId } = params;
  const searchParams = new URLSearchParams();

  if (date) searchParams.append("date", date);
  if (startDate) searchParams.append("startDate", startDate);
  if (endDate) searchParams.append("endDate", endDate);
  if (timezone) searchParams.append("tz", timezone);
  if (viewAsUserId !== undefined && viewAsUserId !== null) {
    searchParams.append("userId", String(viewAsUserId));
  }

  const queryString = searchParams.toString();
  const url = `/api/v1/dashboard/timeline${queryString ? `?${queryString}` : ""}`;

  const raw = await apiClient<TimelineSlotResponse[]>(url);

  return raw.map((slot) => ({
    startMinute: slot.startMinuteFromMidnight,
    slotStartUtc: slot.slotStartUtc,
    productivePct: slot.productivePct,
    neutralPct: slot.neutralPct,
    unproductivePct: slot.unproductivePct,
    idlePct: slot.idlePct ?? 0,
    idleMs: slot.idleMs ?? 0,
    online: slot.online,
  }));
}

