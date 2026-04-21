import { describe, expect, it } from "vitest";
import {
  computeBlockedIntervalsFromSlots,
  type TimeSlotData,
} from "@/components/ui/ProductivityTimeline";
import { computeClaimableIntervalsIso } from "@/utils/offline-claim";
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

describe("computeClaimableIntervalsIso", () => {
  const t0 = Date.UTC(2026, 3, 15, 8, 0, 0, 0);
  const SM = 5 * 60 * 1000;

  it("returns offline slot and idle tail when range spans a fully productive slot", () => {
    const slots: TimeSlotData[] = [
      {
        startMinute: 0,
        slotStartUtc: new Date(t0).toISOString(),
        productivePct: 0,
        neutralPct: 0,
        unproductivePct: 0,
        idlePct: 0,
        idleMs: 0,
        online: false,
      },
      {
        startMinute: 5,
        slotStartUtc: new Date(t0 + SM).toISOString(),
        productivePct: 1,
        neutralPct: 0,
        unproductivePct: 0,
        idlePct: 0,
        idleMs: 0,
        online: true,
      },
      {
        startMinute: 10,
        slotStartUtc: new Date(t0 + 2 * SM).toISOString(),
        productivePct: 0.5,
        neutralPct: 0,
        unproductivePct: 0,
        idlePct: 0.5,
        idleMs: SM,
        online: true,
      },
    ];
    const claim = computeClaimableIntervalsIso(slots, 0, 2, []);
    expect(claim.length).toBe(2);
    expect(new Date(claim[0].start).getTime()).toBe(t0);
    expect(new Date(claim[0].end).getTime()).toBe(t0 + SM);
    // Legacy slots: active work is modeled at the end of the slot (suffix); idle is the leading portion.
    expect(new Date(claim[1].start).getTime()).toBe(t0 + 2 * SM);
    expect(new Date(claim[1].end).getTime()).toBe(t0 + 2 * SM + SM / 2);
  });

  it("drops bars whose total idle/untracked time is below the per-slot merit threshold", () => {
    // Slot 0: wall-clock data, ~12s of idle (below merit) → contributes nothing.
    // Slot 1: wall-clock data, ~90s of *fragmented* idle (6 × 15s) → contributes all fragments.
    const slot0Start = t0;
    const slot1Start = t0 + SM;
    const slots: TimeSlotData[] = [
      {
        startMinute: 0,
        slotStartUtc: new Date(slot0Start).toISOString(),
        productivePct: 0.95,
        neutralPct: 0,
        unproductivePct: 0,
        idlePct: 0.05,
        idleMs: 12_000,
        online: true,
        activeIntervalsUtc: [
          { start: new Date(slot0Start).toISOString(), end: new Date(slot0Start + SM - 12_000).toISOString() },
        ],
        idleIntervalsUtc: [
          { start: new Date(slot0Start + SM - 12_000).toISOString(), end: new Date(slot0Start + SM).toISOString() },
        ],
        remainderIntervalsUtc: [],
      },
      {
        startMinute: 5,
        slotStartUtc: new Date(slot1Start).toISOString(),
        productivePct: 0.7,
        neutralPct: 0,
        unproductivePct: 0,
        idlePct: 0.3,
        idleMs: 90_000,
        online: true,
        activeIntervalsUtc: Array.from({ length: 6 }, (_, i) => ({
          start: new Date(slot1Start + i * 50_000).toISOString(),
          end: new Date(slot1Start + i * 50_000 + 35_000).toISOString(),
        })),
        idleIntervalsUtc: Array.from({ length: 6 }, (_, i) => ({
          start: new Date(slot1Start + i * 50_000 + 35_000).toISOString(),
          end: new Date(slot1Start + i * 50_000 + 50_000).toISOString(),
        })),
        remainderIntervalsUtc: [],
      },
    ];
    const claim = computeClaimableIntervalsIso(slots, 0, 1, []);
    // Slot 0 is filtered by merit (< 60 s total idle). Slot 1 passes, and its
    // actual wall-clock idle fragments are emitted (6 × 15 s). Fragments must
    // stay aligned with real idle — never bridged across active — to avoid
    // double-counting once an admin approves the request.
    expect(claim.length).toBe(6);
    for (const c of claim) {
      const ms = new Date(c.start).getTime();
      expect(ms).toBeGreaterThanOrEqual(slot1Start);
      expect(new Date(c.end).getTime() - ms).toBe(15_000);
    }
  });

  it("removes claimable time that overlaps a pending window", () => {
    const slots: TimeSlotData[] = [
      {
        startMinute: 0,
        slotStartUtc: new Date(t0).toISOString(),
        productivePct: 0,
        neutralPct: 0,
        unproductivePct: 0,
        idlePct: 0,
        idleMs: 0,
        online: false,
      },
    ];
    const pending = [
      {
        startAt: new Date(t0 + 60_000).toISOString(),
        endAt: new Date(t0 + 4 * 60_000).toISOString(),
      },
    ];
    const claim = computeClaimableIntervalsIso(slots, 0, 0, pending);
    expect(claim.length).toBe(2);
    expect(new Date(claim[0].start).getTime()).toBe(t0);
    expect(new Date(claim[0].end).getTime()).toBe(t0 + 60_000);
    expect(new Date(claim[1].start).getTime()).toBe(t0 + 4 * 60_000);
    expect(new Date(claim[1].end).getTime()).toBe(t0 + SM);
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
