"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import Modal from "../Modal/Modal";
import type { OfflineTimeCategory } from "@/services/offlineTimeRequests";
import { formatDuration } from "@/services/dashboardStats";

export interface OfflineTimeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Outer bounds from timeline drag (whole 5‑minute slots). */
  selectionStartIso: string;
  selectionEndIso: string;
  /** Active work + pending offline — hatched on rail (not claimable). */
  blockedIntervalsIso: { start: string; end: string }[];
  /** Claimable segments inside the selection (user can trim or exclude). */
  claimableSegmentsIso: { start: string; end: string }[];
  onSubmit: (payload: {
    segments: { startAt: string; endAt: string }[];
    description: string;
    category: OfflineTimeCategory;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

type MsInterval = { startMs: number; endMs: number };

/**
 * Minimum duration of a submittable segment. Kept small because worker data can
 * fragment idle time into short contiguous pieces (each app switch restarts the
 * active→idle ordering inside the slot).
 */
const MIN_SEGMENT_MS = 1000;

/** Minimum gap between start and end handles in single-segment mode (UX only). */
const HANDLE_MIN_GAP_MS = 60 * 1000;

function mergeIntervals(intervals: MsInterval[]): MsInterval[] {
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

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

function defaultStartEnd(
  allowed: MsInterval[],
  winStart: number,
  winEnd: number,
): MsInterval {
  let best: MsInterval | null = null;
  for (const I of allowed) {
    const is = Math.max(I.startMs, winStart);
    const ie = Math.min(I.endMs, winEnd);
    const span = ie - is;
    if (span < MIN_SEGMENT_MS) continue;
    if (!best || span > best.endMs - best.startMs) {
      best = { startMs: is, endMs: ie };
    }
  }
  if (!best) {
    return { startMs: winStart, endMs: Math.max(winStart + MIN_SEGMENT_MS, winEnd) };
  }
  return best;
}

function isValidSegment(
  startMs: number,
  endMs: number,
  allowed: MsInterval[],
): boolean {
  if (endMs - startMs < MIN_SEGMENT_MS) return false;
  return allowed.some(
    (I) => startMs >= I.startMs && endMs <= I.endMs && startMs < endMs,
  );
}

/** Returns the smaller of HANDLE_MIN_GAP_MS or the allowed segment size − 1ms. */
function handleMinGapWithin(span: number): number {
  return Math.max(1, Math.min(HANDLE_MIN_GAP_MS, span - 1));
}

function clampStartGivenEnd(
  start: number,
  end: number,
  allowed: MsInterval[],
): number {
  for (const I of allowed) {
    if (end <= I.startMs || end > I.endMs) continue;
    const gap = handleMinGapWithin(I.endMs - I.startMs);
    const lo = I.startMs;
    const hi = Math.min(end - gap, I.endMs - gap);
    if (lo <= hi) return clamp(start, lo, hi);
  }
  return start;
}

function clampEndGivenStart(
  start: number,
  end: number,
  allowed: MsInterval[],
): number {
  for (const I of allowed) {
    if (start < I.startMs || start >= I.endMs) continue;
    const gap = handleMinGapWithin(I.endMs - I.startMs);
    const lo = Math.max(start + gap, I.startMs);
    const hi = I.endMs;
    if (lo <= hi) return clamp(end, lo, hi);
  }
  return end;
}

function msToTimeInputValue(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Combine local calendar day of `baseMs` with HH:mm from the time input. */
function combineTimeOnBaseMs(baseMs: number, timeHHmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(timeHHmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min) || h > 23 || min > 59) return null;
  const d = new Date(baseMs);
  d.setHours(h, min, 0, 0);
  return d.getTime();
}

function isSameLocalCalendarDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function OfflineTimeRequestModal({
  isOpen,
  onClose,
  selectionStartIso,
  selectionEndIso,
  blockedIntervalsIso,
  claimableSegmentsIso,
  onSubmit,
  isSubmitting = false,
}: OfflineTimeRequestModalProps) {
  const [startMs, setStartMs] = useState(0);
  const [endMs, setEndMs] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<OfflineTimeCategory>("productive");
  const [included, setIncluded] = useState<boolean[]>([]);

  const railRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<"start" | "end" | null>(null);
  const startMsRef = useRef(startMs);
  const endMsRef = useRef(endMs);
  useEffect(() => {
    startMsRef.current = startMs;
    endMsRef.current = endMs;
  }, [startMs, endMs]);

  const winStart = useMemo(
    () => new Date(selectionStartIso).getTime(),
    [selectionStartIso],
  );
  const winEnd = useMemo(
    () => new Date(selectionEndIso).getTime(),
    [selectionEndIso],
  );

  const blockedMs = useMemo(() => {
    return mergeIntervals(
      blockedIntervalsIso.map((b) => ({
        startMs: new Date(b.start).getTime(),
        endMs: new Date(b.end).getTime(),
      })),
    );
  }, [blockedIntervalsIso]);

  const allowedMs = useMemo(() => {
    return claimableSegmentsIso.map((s) => ({
      startMs: new Date(s.start).getTime(),
      endMs: new Date(s.end).getTime(),
    }));
  }, [claimableSegmentsIso]);

  const singleMode = claimableSegmentsIso.length === 1;

  /** Until state syncs with `claimableSegmentsIso`, treat all multi segments as included. */
  const multiIncluded = useMemo(() => {
    if (singleMode) return [];
    if (
      included.length === claimableSegmentsIso.length &&
      claimableSegmentsIso.length > 0
    ) {
      return included;
    }
    return claimableSegmentsIso.map(() => true);
  }, [singleMode, included, claimableSegmentsIso]);

  useEffect(() => {
    if (!isOpen) return;
    if (!singleMode) {
      setIncluded(claimableSegmentsIso.map(() => true));
      return;
    }
    if (Number.isNaN(winStart) || Number.isNaN(winEnd) || winEnd <= winStart) {
      return;
    }
    if (allowedMs.length === 0) return;
    const def = defaultStartEnd(allowedMs, winStart, winEnd);
    setStartMs(def.startMs);
    setEndMs(def.endMs);
  }, [isOpen, singleMode, winStart, winEnd, allowedMs, claimableSegmentsIso]);

  const segmentValid = useMemo(() => {
    if (claimableSegmentsIso.length === 0) return false;
    if (singleMode) {
      return isValidSegment(startMs, endMs, allowedMs);
    }
    return multiIncluded.some((inc, i) => {
      if (!inc) return false;
      const s = claimableSegmentsIso[i];
      const a = new Date(s.start).getTime();
      const b = new Date(s.end).getTime();
      return b - a >= MIN_SEGMENT_MS;
    });
  }, [claimableSegmentsIso, singleMode, startMs, endMs, allowedMs, multiIncluded]);

  const clientXToMs = useCallback(
    (clientX: number) => {
      const el = railRef.current;
      if (!el) return winStart;
      const rect = el.getBoundingClientRect();
      const w = rect.width || 1;
      const frac = clamp((clientX - rect.left) / w, 0, 1);
      return winStart + frac * (winEnd - winStart);
    },
    [winStart, winEnd],
  );

  useEffect(() => {
    if (!singleMode) return;
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const t = clientXToMs(e.clientX);
      if (dragRef.current === "start") {
        setStartMs(clampStartGivenEnd(t, endMsRef.current, allowedMs));
      } else {
        setEndMs(clampEndGivenStart(startMsRef.current, t, allowedMs));
      }
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [allowedMs, clientXToMs, singleMode]);

  const sameLocalDay = useMemo(
    () => isSameLocalCalendarDay(winStart, winEnd),
    [winStart, winEnd],
  );

  const winSpan = winEnd - winStart || 1;
  const pct = (ms: number) => ((ms - winStart) / winSpan) * 100;

  const startTimeValue = msToTimeInputValue(startMs);
  const endTimeValue = msToTimeInputValue(endMs);
  const minTimeValue = msToTimeInputValue(winStart);
  const maxTimeValue = msToTimeInputValue(winEnd);

  const onStartInput = (v: string) => {
    const base = winStart;
    const t = combineTimeOnBaseMs(base, v);
    if (t === null) return;
    const tw = clamp(t, winStart, winEnd);
    setStartMs(clampStartGivenEnd(tw, endMs, allowedMs));
  };

  const onEndInput = (v: string) => {
    const base = sameLocalDay ? winStart : winEnd;
    const t = combineTimeOnBaseMs(base, v);
    if (t === null) return;
    const tw = clamp(t, winStart, winEnd);
    setEndMs(clampEndGivenStart(startMs, tw, allowedMs));
  };

  const handleSubmit = async () => {
    if (!description.trim() || !segmentValid) return;

    const segments: { startAt: string; endAt: string }[] = [];
    if (singleMode) {
      segments.push({
        startAt: new Date(startMs).toISOString(),
        endAt: new Date(endMs).toISOString(),
      });
    } else {
      for (let i = 0; i < claimableSegmentsIso.length; i++) {
        if (!multiIncluded[i]) continue;
        const s = claimableSegmentsIso[i];
        const a = new Date(s.start).getTime();
        const b = new Date(s.end).getTime();
        if (b - a >= MIN_SEGMENT_MS) {
          segments.push({ startAt: s.start, endAt: s.end });
        }
      }
      if (segments.length === 0) {
        toast.error("Select at least one claimable segment with at least one minute.");
        return;
      }
    }

    await onSubmit({
      segments,
      description: description.trim(),
      category,
    });
  };

  const hasClaimable = claimableSegmentsIso.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request offline time"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          {singleMode
            ? "Adjust the range on the timeline (or type below). Hatched regions are already tracked or pending — not claimable."
            : "Uncheck segments you do not want to include. Hatched regions are already tracked or pending — not claimable."}
        </p>

        {!hasClaimable ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            There is no claimable time in this selection (everything is tracked).
            Close and select a different range.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Timeline (selection)</span>
                <span className="tabular-nums">
                  {formatShort(winStart)} → {formatShort(winEnd)}
                </span>
              </div>
              <div
                ref={railRef}
                className="relative h-11 select-none rounded-md border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-800"
              >
                {blockedMs.map((b, i) => {
                  const left = Math.max(b.startMs, winStart);
                  const right = Math.min(b.endMs, winEnd);
                  if (right <= left) return null;
                  return (
                    <div
                      key={`blk-${i}-${left}`}
                      className="pointer-events-none absolute bottom-0 top-0 bg-slate-300/80 bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(100,116,139,0.35)_4px,rgba(100,116,139,0.35)_8px)] dark:bg-slate-600/80"
                      style={{
                        left: `${pct(left)}%`,
                        width: `${((right - left) / winSpan) * 100}%`,
                      }}
                      title="Not claimable (tracked or pending)"
                    />
                  );
                })}
                {singleMode ? (
                  <div
                    className="pointer-events-none absolute bottom-0 top-0 bg-emerald-400/25"
                    style={{
                      left: `${pct(Math.min(startMs, endMs))}%`,
                      width: `${(Math.abs(endMs - startMs) / winSpan) * 100}%`,
                    }}
                  />
                ) : (
                  claimableSegmentsIso.map((seg, i) => {
                    if (!multiIncluded[i]) return null;
                    const left = Math.max(new Date(seg.start).getTime(), winStart);
                    const right = Math.min(new Date(seg.end).getTime(), winEnd);
                    if (right <= left) return null;
                    return (
                      <div
                        key={`claim-${i}`}
                        className="pointer-events-none absolute bottom-0 top-0 bg-emerald-400/25"
                        style={{
                          left: `${pct(left)}%`,
                          width: `${((right - left) / winSpan) * 100}%`,
                        }}
                      />
                    );
                  })
                )}
                {singleMode ? (
                  <>
                    <button
                      type="button"
                      aria-label="Adjust start time"
                      className="absolute top-1/2 z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white bg-emerald-600 shadow-md touch-none active:cursor-grabbing"
                      style={{ left: `${pct(startMs)}%` }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        dragRef.current = "start";
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Adjust end time"
                      className="absolute top-1/2 z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white bg-emerald-600 shadow-md touch-none active:cursor-grabbing"
                      style={{ left: `${pct(endMs)}%` }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        dragRef.current = "end";
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                      }}
                    />
                  </>
                ) : null}
              </div>
            </div>

            {!singleMode ? (
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-600">
                  Include claimable segments
                </div>
                <ul className="max-h-40 space-y-2 overflow-y-auto">
                  {claimableSegmentsIso.map((seg, i) => {
                    const a = new Date(seg.start).getTime();
                    const b = new Date(seg.end).getTime();
                    const dur = b - a;
                    return (
                      <li key={`inc-${i}`}>
                        <label className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800/60">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
                            checked={multiIncluded[i] ?? true}
                            onChange={(e) => {
                              setIncluded((prev) => {
                                const base =
                                  prev.length === claimableSegmentsIso.length
                                    ? [...prev]
                                    : claimableSegmentsIso.map(() => true);
                                base[i] = e.target.checked;
                                return base;
                              });
                            }}
                          />
                          <span className="text-sm text-slate-800 dark:text-slate-100">
                            {formatShort(a)} → {formatShort(b)}
                            <span className="ml-2 tabular-nums text-slate-500">
                              ({formatDuration(dur)})
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {singleMode ? (
              <div className="space-y-1.5">
                {!sameLocalDay ? (
                  <p className="text-xs text-slate-500">
                    Start time uses the first day of the selection; end time uses the
                    last day (spans multiple calendar days).
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Times are local (same day as the selection).
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Start time
                    </label>
                    <input
                      type="time"
                      step={60}
                      value={startTimeValue}
                      min={sameLocalDay ? minTimeValue : undefined}
                      max={sameLocalDay ? maxTimeValue : undefined}
                      onChange={(e) => onStartInput(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      End time
                    </label>
                    <input
                      type="time"
                      step={60}
                      value={endTimeValue}
                      min={sameLocalDay ? minTimeValue : undefined}
                      max={sameLocalDay ? maxTimeValue : undefined}
                      onChange={(e) => onEndInput(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {singleMode && !segmentValid && hasClaimable ? (
              <p className="text-xs text-amber-700">
                Range must stay within claimable time (not overlapping tracked
                activity) and be at least one minute.
              </p>
            ) : null}
            {!singleMode && !segmentValid && hasClaimable ? (
              <p className="text-xs text-amber-700">
                Include at least one segment of at least one minute.
              </p>
            ) : null}
          </>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>
          <div className="space-y-2">
            {(
              [
                ["productive", "Productive", "bg-emerald-500"],
                ["unproductive", "Unproductive", "bg-orange-500"],
                ["neutral", "Neutral", "bg-slate-400"],
              ] as const
            ).map(([value, label, swatch]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50"
              >
                <input
                  type="radio"
                  name="offline-category"
                  checked={category === value}
                  onChange={() => setCategory(value)}
                  className="h-4 w-4 border-slate-300 text-emerald-600"
                />
                <span className="text-sm text-slate-800">{label}</span>
                <span className={`ml-auto h-4 w-4 rounded ${swatch}`} />
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="e.g. Company-wide meeting, client call…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              isSubmitting ||
              !description.trim() ||
              !segmentValid ||
              !hasClaimable
            }
            onClick={() => void handleSubmit()}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Submit request"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function formatShort(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
