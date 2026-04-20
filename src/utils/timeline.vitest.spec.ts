import { describe, expect, it } from "vitest";
import {
  computeBlockedIntervalsFromSlots,
  type TimeSlotData,
} from "@/components/ui/ProductivityTimeline";
import { mergeMsIntervals } from "@/utils/timeline-intervals";
import {
  msRangeToSlotIndices,
  msToTrackPx,
  msToTrackSpanPx,
} from "@/utils/timeline-geometry";

const SLOT_MS = 5 * 60 * 1000;
const BAR_W = 5;
const GAP = 2;

function makeSlots(count: number, dayStartMs: number): TimeSlotData[] {
  return Array.from({ length: count }, (_, i) => ({
    startMinute: i * 5,
    slotStartUtc: new Date(dayStartMs + i * SLOT_MS).toISOString(),
    productivePct: 0,
    neutralPct: 0,
    unproductivePct: 0,
    idlePct: 0,
    idleMs: 0,
    online: false,
  }));
}

describe("mergeMsIntervals", () => {
  it("merges overlapping intervals", () => {
    expect(
      mergeMsIntervals([
        { startMs: 0, endMs: 100 },
        { startMs: 80, endMs: 200 },
      ]),
    ).toEqual([{ startMs: 0, endMs: 200 }]);
  });
});

describe("computeBlockedIntervalsFromSlots", () => {
  const t0 = Date.UTC(2026, 3, 15, 8, 0, 0, 0);

  it("uses merged active intervals when wall-clock fields exist", () => {
    const slotBase = {
      startMinute: 0,
      productivePct: 0,
      neutralPct: 0,
      unproductivePct: 0,
      idlePct: 0,
      idleMs: 0,
      online: true,
      activeIntervalsUtc: [],
      idleIntervalsUtc: [],
      remainderIntervalsUtc: [],
    };
    const a = t0 + 60_000;
    const b = t0 + 120_000;
    const slots: TimeSlotData[] = [
      {
        ...slotBase,
        slotStartUtc: new Date(t0).toISOString(),
        activeIntervalsUtc: [{ start: new Date(a).toISOString(), end: new Date(b).toISOString() }],
      },
    ];
    const blocked = computeBlockedIntervalsFromSlots(slots, 0, 0);
    expect(blocked).toHaveLength(1);
    expect(blocked[0].start).toBe(new Date(a).toISOString());
    expect(blocked[0].end).toBe(new Date(b).toISOString());
  });
});

describe("timeline-geometry", () => {
  const t0 = Date.UTC(2026, 3, 15, 8, 0, 0, 0);

  it("msToTrackPx maps midpoint of first slot", () => {
    const slots = makeSlots(4, t0);
    const mid = t0 + SLOT_MS / 2;
    const px = msToTrackPx(mid, slots, SLOT_MS, BAR_W, GAP);
    expect(px).toBeCloseTo(2.5, 5);
  });

  it("msToTrackSpanPx spans two slots", () => {
    const slots = makeSlots(10, t0);
    const a = t0 + SLOT_MS * 0.2;
    const b = t0 + SLOT_MS * 1.8;
    const { left, width } = msToTrackSpanPx(
      a,
      b,
      slots,
      SLOT_MS,
      BAR_W,
      GAP,
    );
    expect(left).toBeGreaterThan(0);
    expect(width).toBeGreaterThan(BAR_W + GAP);
  });

  it("msRangeToSlotIndices overlaps slots 1 and 2", () => {
    const slots = makeSlots(5, t0);
    const lo = t0 + SLOT_MS * 1.1;
    const hi = t0 + SLOT_MS * 2.9;
    expect(msRangeToSlotIndices(lo, hi, slots, SLOT_MS)).toEqual({
      lo: 1,
      hi: 2,
    });
  });
});
