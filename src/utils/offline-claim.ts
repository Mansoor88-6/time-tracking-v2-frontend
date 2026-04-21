/**
 * Claimable offline-time intervals for productivity timeline (blocked = active work + pending requests).
 */

import { mergeMsIntervals, type MsInterval } from "@/utils/timeline-intervals";

/** Same fields as TimeSlotData in ProductivityTimeline (kept local to avoid circular imports). */
export type TimelineSlotForOfflineClaim = {
  startMinute: number;
  slotStartUtc?: string;
  productivePct: number;
  neutralPct: number;
  unproductivePct: number;
  idlePct: number;
  idleMs: number;
  online: boolean;
  activeIntervalsUtc?: { start: string; end: string }[];
  idleIntervalsUtc?: { start: string; end: string }[];
  remainderIntervalsUtc?: { start: string; end: string }[];
};

export const TIMELINE_SLOT_MINUTES = 5;
export const TIMELINE_SLOT_MS = TIMELINE_SLOT_MINUTES * 60 * 1000;

/**
 * Final floor on an emitted claimable fragment (worker-noise splinters).
 * Real "does this bar have enough idle to be claimable" merit is enforced at the
 * slot level via `CLAIM_SLOT_MERIT_MIN_MS` below. This floor just hides the
 * sub-5-second pieces the worker sometimes produces around rapid app switches,
 * which otherwise show up as "0 min" rows on the admin side.
 */
export const OFFLINE_MIN_SEGMENT_MS = 5_000;

/**
 * Per-slot merit: a single 5-minute slot must have **at least this much total**
 * idle/untracked/offline wall time to contribute any claimable fragments.
 *
 * This prevents "fully productive" bars (that only show a few seconds of idle
 * noise from the worker) from being submittable, while still letting a bar with
 * >= 1 minute of *fragmented* idle time pass (all its fragments are kept).
 */
export const CLAIM_SLOT_MERIT_MIN_MS = 60 * 1000;

type PendingRange = { startAt: string; endAt: string };

/** Aligns with SlotBar: fractions of the 5‑min slot, capped when sum > 1, remainder = untracked. */
export function getSlotFractions(slot: TimelineSlotForOfflineClaim): {
  productivePct: number;
  neutralPct: number;
  unproductivePct: number;
  idlePct: number;
  remainderPct: number;
} {
  let p = Math.max(0, slot.productivePct);
  let n = Math.max(0, slot.neutralPct);
  let u = Math.max(0, slot.unproductivePct);
  let i = Math.max(0, slot.idlePct);
  const sum = p + n + u + i;
  if (sum > 1 && sum > 0) {
    p /= sum;
    n /= sum;
    u /= sum;
    i /= sum;
  }
  const remainderPct = Math.max(0, 1 - p - n - u - i);
  return { productivePct: p, neutralPct: n, unproductivePct: u, idlePct: i, remainderPct };
}

/**
 * Tracked productive+neutral+unproductive wall time (blocked in offline modal).
 * - When `activeIntervalsUtc` is present on a slot, uses those wall-clock intervals only.
 * - Otherwise (legacy / mock data): active work is modeled at the **end** of the slot (suffix),
 *   matching worker bar semantics (active/idle segments ordered early→late in time).
 */
export function computeBlockedIntervalsFromSlots(
  slots: TimelineSlotForOfflineClaim[],
  lo: number,
  hi: number,
): { start: string; end: string }[] {
  const raw: MsInterval[] = [];
  for (let i = lo; i <= hi; i++) {
    const s = slots[i];
    if (!s?.slotStartUtc) continue;
    const slotStart = new Date(s.slotStartUtc).getTime();
    if (Number.isNaN(slotStart)) continue;
    const slotEnd = slotStart + TIMELINE_SLOT_MS;
    if (!s.online) continue;

    if (s.activeIntervalsUtc !== undefined) {
      for (const iv of s.activeIntervalsUtc) {
        const a = new Date(iv.start).getTime();
        const b = new Date(iv.end).getTime();
        if (!Number.isNaN(a) && !Number.isNaN(b) && b > a) {
          raw.push({ startMs: a, endMs: b });
        }
      }
    } else {
      const { productivePct, neutralPct, unproductivePct } = getSlotFractions(s);
      const blockedMs = Math.min(
        TIMELINE_SLOT_MS,
        (productivePct + neutralPct + unproductivePct) * TIMELINE_SLOT_MS,
      );
      if (blockedMs <= 0) continue;
      raw.push({ startMs: slotEnd - blockedMs, endMs: slotEnd });
    }
  }
  return mergeMsIntervals(raw).map(({ startMs, endMs }) => ({
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
  }));
}

export function slotRangeToIsoBounds(
  slots: TimelineSlotForOfflineClaim[],
  lo: number,
  hi: number,
) {
  const first = slots[lo];
  const last = slots[hi];
  const dayBase = new Date();
  dayBase.setHours(0, 0, 0, 0);
  const startMs = first.slotStartUtc
    ? new Date(first.slotStartUtc).getTime()
    : dayBase.getTime() + first.startMinute * 60 * 1000;
  const lastSlotStart = last.slotStartUtc
    ? new Date(last.slotStartUtc).getTime()
    : dayBase.getTime() + last.startMinute * 60 * 1000;
  const endMs = lastSlotStart + TIMELINE_SLOT_MINUTES * 60 * 1000;
  return {
    startIso: new Date(startMs).toISOString(),
    endIso: new Date(endMs).toISOString(),
  };
}

export function getPendingRangeMs(r: PendingRange): { rs: number; re: number } | null {
  const raw = r as {
    startAt?: string;
    endAt?: string;
    start_at?: string;
    end_at?: string;
  };
  const s = raw.startAt ?? raw.start_at;
  const e = raw.endAt ?? raw.end_at;
  if (!s || !e) return null;
  const rs = new Date(s).getTime();
  const re = new Date(e).getTime();
  if (Number.isNaN(rs) || Number.isNaN(re)) return null;
  return { rs, re };
}

function mergeIntervalsMs(intervals: MsInterval[]): MsInterval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.startMs - b.startMs);
  const out: MsInterval[] = [];
  for (const cur of sorted) {
    const last = out[out.length - 1];
    if (!last || cur.startMs > last.endMs) {
      out.push({ startMs: cur.startMs, endMs: cur.endMs });
    } else {
      last.endMs = Math.max(last.endMs, cur.endMs);
    }
  }
  return out;
}

export function subtractBlockedMs(
  winStart: number,
  winEnd: number,
  blocked: MsInterval[],
): MsInterval[] {
  let cur: MsInterval[] = [{ startMs: winStart, endMs: winEnd }];
  for (const b of blocked) {
    const bi = Math.max(b.startMs, winStart);
    const bo = Math.min(b.endMs, winEnd);
    if (bi >= bo) continue;
    cur = cur
      .flatMap((c) => {
        const next: MsInterval[] = [];
        if (c.startMs < bi) {
          next.push({ startMs: c.startMs, endMs: Math.min(c.endMs, bi) });
        }
        if (bo < c.endMs) {
          next.push({ startMs: Math.max(c.startMs, bo), endMs: c.endMs });
        }
        return next;
      })
      .filter((x) => x.endMs - x.startMs >= 1);
  }
  return cur.sort((a, b) => a.startMs - b.startMs);
}

function clipIntervalsToWindow(
  intervals: MsInterval[],
  winStart: number,
  winEnd: number,
): MsInterval[] {
  const out: MsInterval[] = [];
  for (const iv of intervals) {
    const a = Math.max(iv.startMs, winStart);
    const b = Math.min(iv.endMs, winEnd);
    if (b > a) out.push({ startMs: a, endMs: b });
  }
  return mergeIntervalsMs(out);
}

function subtractPendingFromClaimIntervals(
  claim: MsInterval[],
  pendingMerged: MsInterval[],
): MsInterval[] {
  if (pendingMerged.length === 0) return claim;
  const out: MsInterval[] = [];
  for (const c of claim) {
    out.push(...subtractBlockedMs(c.startMs, c.endMs, pendingMerged));
  }
  return mergeIntervalsMs(out);
}

function parseIsoIntervals(
  list: { start: string; end: string }[] | undefined,
): MsInterval[] {
  const out: MsInterval[] = [];
  for (const iv of list ?? []) {
    const a = new Date(iv.start).getTime();
    const b = new Date(iv.end).getTime();
    if (!Number.isNaN(a) && !Number.isNaN(b) && b > a) {
      out.push({ startMs: a, endMs: b });
    }
  }
  return out;
}

function totalDurationMs(intervals: MsInterval[]): number {
  let sum = 0;
  for (const iv of intervals) sum += iv.endMs - iv.startMs;
  return sum;
}

/**
 * Returns the claimable intervals **contributed by a single slot**, enforcing
 * `CLAIM_SLOT_MERIT_MIN_MS` so bars with essentially no idle time contribute nothing.
 *
 * Source of truth priority:
 *  1. Offline slot  → full 5-minute span.
 *  2. `idleIntervalsUtc` / `remainderIntervalsUtc` (exact wall-clock).
 *  3. `activeIntervalsUtc` only  → claim = slot minus active intervals.
 *  4. Legacy pct-based mock data → active modeled as slot suffix, claim as prefix.
 *
 * We deliberately emit the **real wall-clock idle fragments** (no bridging,
 * no span-collapse). Claim intervals must never overlap tracked active time —
 * any collapse that spans active work leads to double-counting once an admin
 * approves the request (productive grows by more than the actual idle that
 * existed, and the slot never "fills up" to 100 % productive).
 */
function buildClaimForSlot(s: TimelineSlotForOfflineClaim): MsInterval[] {
  if (!s?.slotStartUtc) return [];
  const slotStart = new Date(s.slotStartUtc).getTime();
  if (Number.isNaN(slotStart)) return [];
  const slotEnd = slotStart + TIMELINE_SLOT_MS;

  if (!s.online) {
    return [{ startMs: slotStart, endMs: slotEnd }];
  }

  let claim: MsInterval[];
  if (s.idleIntervalsUtc !== undefined || s.remainderIntervalsUtc !== undefined) {
    const idle = parseIsoIntervals(s.idleIntervalsUtc);
    const rem = parseIsoIntervals(s.remainderIntervalsUtc);
    claim = mergeIntervalsMs([...idle, ...rem])
      .map((iv) => ({
        startMs: Math.max(iv.startMs, slotStart),
        endMs: Math.min(iv.endMs, slotEnd),
      }))
      .filter((iv) => iv.endMs > iv.startMs);
  } else if (s.activeIntervalsUtc !== undefined) {
    const active = mergeIntervalsMs(parseIsoIntervals(s.activeIntervalsUtc));
    claim = subtractBlockedMs(slotStart, slotEnd, active);
  } else {
    const { productivePct, neutralPct, unproductivePct } = getSlotFractions(s);
    const blockedMs = Math.min(
      TIMELINE_SLOT_MS,
      (productivePct + neutralPct + unproductivePct) * TIMELINE_SLOT_MS,
    );
    const claimMs = TIMELINE_SLOT_MS - blockedMs;
    claim = claimMs > 0 ? [{ startMs: slotStart, endMs: slotStart + claimMs }] : [];
  }

  if (totalDurationMs(claim) < CLAIM_SLOT_MERIT_MIN_MS) return [];
  return claim;
}

function buildClaimPerSlot(
  slots: TimelineSlotForOfflineClaim[],
  lo: number,
  hi: number,
): MsInterval[] {
  const raw: MsInterval[] = [];
  for (let i = lo; i <= hi; i++) {
    const s = slots[i];
    if (!s) continue;
    raw.push(...buildClaimForSlot(s));
  }
  return mergeIntervalsMs(raw);
}

/**
 * Active work + pending offline requests overlapping [lo,hi], merged, as ISO intervals clipped to the window.
 */
export function mergeBlockedIntervalsIsoForWindow(
  slots: TimelineSlotForOfflineClaim[],
  lo: number,
  hi: number,
  pendingRanges: PendingRange[],
): { start: string; end: string }[] {
  const { startIso, endIso } = slotRangeToIsoBounds(slots, lo, hi);
  const winStart = new Date(startIso).getTime();
  const winEnd = new Date(endIso).getTime();
  if (Number.isNaN(winStart) || Number.isNaN(winEnd) || winEnd <= winStart) {
    return [];
  }

  const activeMs: MsInterval[] = computeBlockedIntervalsFromSlots(slots, lo, hi).map((b) => ({
    startMs: new Date(b.start).getTime(),
    endMs: new Date(b.end).getTime(),
  }));

  const pendingMs: MsInterval[] = [];
  for (const r of pendingRanges) {
    const b = getPendingRangeMs(r);
    if (!b) continue;
    const bi = Math.max(b.rs, winStart);
    const bo = Math.min(b.re, winEnd);
    if (bo > bi) pendingMs.push({ startMs: bi, endMs: bo });
  }

  return mergeIntervalsMs([...activeMs, ...pendingMs]).map(({ startMs, endMs }) => ({
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
  }));
}

/**
 * Disjoint claimable intervals inside the slot range (idle/untracked not blocked by active work or pending).
 */
export function computeClaimableIntervalsIso(
  slots: TimelineSlotForOfflineClaim[],
  lo: number,
  hi: number,
  pendingRanges: PendingRange[],
): { start: string; end: string }[] {
  const { startIso, endIso } = slotRangeToIsoBounds(slots, lo, hi);
  const winStart = new Date(startIso).getTime();
  const winEnd = new Date(endIso).getTime();
  if (Number.isNaN(winStart) || Number.isNaN(winEnd) || winEnd <= winStart) {
    return [];
  }

  const pendingMsRaw: MsInterval[] = [];
  for (const r of pendingRanges) {
    const b = getPendingRangeMs(r);
    if (!b) continue;
    const bi = Math.max(b.rs, winStart);
    const bo = Math.min(b.re, winEnd);
    if (bo > bi) pendingMsRaw.push({ startMs: bi, endMs: bo });
  }
  const pendingMerged = mergeIntervalsMs(pendingMsRaw);

  const claim = buildClaimPerSlot(slots, lo, hi);
  let clipped = clipIntervalsToWindow(claim, winStart, winEnd);
  clipped = subtractPendingFromClaimIntervals(clipped, pendingMerged);

  return clipped
    .filter((c) => c.endMs - c.startMs >= OFFLINE_MIN_SEGMENT_MS)
    .map(({ startMs, endMs }) => ({
      start: new Date(startMs).toISOString(),
      end: new Date(endMs).toISOString(),
    }));
}
