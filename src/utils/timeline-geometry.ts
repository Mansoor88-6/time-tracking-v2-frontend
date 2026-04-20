import type { TimeSlotData } from "@/components/ui/ProductivityTimeline";

/**
 * Map wall-clock ms to horizontal position (px) in the bar track (left edge of chart = 0).
 */
export function msToTrackPx(
  ms: number,
  slots: TimeSlotData[],
  slotMs: number,
  barWidthPx: number,
  gapPx: number,
): number {
  if (!slots.length) return 0;
  const first = slots[0].slotStartUtc;
  const last = slots[slots.length - 1].slotStartUtc;
  if (!first || !last) return 0;
  const firstMs = new Date(first).getTime();
  const lastMs = new Date(last).getTime();
  const lastEnd = lastMs + slotMs;
  if (Number.isNaN(firstMs) || Number.isNaN(lastMs)) return 0;
  if (ms <= firstMs) return 0;
  if (ms >= lastEnd) {
    return (slots.length - 1) * (barWidthPx + gapPx) + barWidthPx;
  }
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i].slotStartUtc;
    if (!s) continue;
    const ss = new Date(s).getTime();
    const se = ss + slotMs;
    if (Number.isNaN(ss)) continue;
    if (ms >= ss && ms < se) {
      const frac = (ms - ss) / slotMs;
      return i * (barWidthPx + gapPx) + frac * barWidthPx;
    }
  }
  return 0;
}

export function msToTrackSpanPx(
  startMs: number,
  endMs: number,
  slots: TimeSlotData[],
  slotMs: number,
  barWidthPx: number,
  gapPx: number,
): { left: number; width: number } {
  const left = msToTrackPx(startMs, slots, slotMs, barWidthPx, gapPx);
  const right = msToTrackPx(endMs, slots, slotMs, barWidthPx, gapPx);
  return { left, width: Math.max(0, right - left) };
}

/** Slot index range overlapping [rangeStartMs, rangeEndMs). */
export function msRangeToSlotIndices(
  rangeStartMs: number,
  rangeEndMs: number,
  slots: TimeSlotData[],
  slotMs: number,
): { lo: number; hi: number } | null {
  let lo = -1;
  let hi = -1;
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i].slotStartUtc;
    if (!s) continue;
    const ss = new Date(s).getTime();
    const se = ss + slotMs;
    if (Number.isNaN(ss)) continue;
    if (se > rangeStartMs && ss < rangeEndMs) {
      if (lo < 0) lo = i;
      hi = i;
    }
  }
  if (lo < 0 || hi < 0) return null;
  return { lo, hi };
}
