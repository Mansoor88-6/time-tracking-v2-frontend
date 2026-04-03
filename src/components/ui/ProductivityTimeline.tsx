"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OfflineTimeRequestModal } from "@/components/ui/OfflineTimeRequestModal";
import { cn } from "@/utils/tw";

/**
 * Represents a single 5-minute time slot in the productivity timeline.
 * `startMinute` is minutes from midnight (0–1435) and percentages are 0–1.
 *
 * When you wire real data, map each bucket of events (e.g. 5‑minute window)
 * to these fields using active durations only:
 * - productivePct    = productiveActiveMs / totalActiveMsForSlot
 * - neutralPct       = neutralActiveMs / totalActiveMsForSlot
 * - unproductivePct  = unproductiveActiveMs / totalActiveMsForSlot
 * - online           = true when there is any tracked activity in the slot
 */
export type TimeSlotData = {
  startMinute: number;
  /** ISO start of this 5-minute bucket (from API); used for offline-time requests. */
  slotStartUtc?: string;
  productivePct: number;
  neutralPct: number;
  unproductivePct: number;
  /** Fraction of the slot that was idle (0–1). */
  idlePct: number;
  idleMs: number;
  online: boolean;
};

export interface ProductivityTimelineProps {
  /**
   * Optional array of time slots. When omitted, the component renders
   * a realistic mock workday using two sessions similar to Desktime's demo.
   */
  slots?: TimeSlotData[];
  /** When set, user can drag-select idle ranges and submit an offline-time request. */
  onOfflineTimeSubmit?: (payload: {
    startAt: string;
    endAt: string;
    description: string;
    category: "productive" | "neutral" | "unproductive";
  }) => Promise<void>;
  /** Pending offline-time requests (sky tint on overlapping slots until approved). */
  pendingOfflineRanges?: { startAt: string; endAt: string }[];
}

const TOTAL_MINUTES = 24 * 60;
const SLOT_MINUTES = 5;

/** Pixel width per slot bar (flex-1 was overriding w-[15px] and squeezing ~288 bars to ~3px each). */
const SLOT_BAR_WIDTH_PX = 5;
const SLOT_BAR_GAP_PX = 2;

// Colors aligned with the provided design and existing palette
const PRODUCTIVE_COLOR = "#6BBF4E";
const NEUTRAL_COLOR = "#D0D0D0";
const UNPRODUCTIVE_COLOR = "#E07A5F";
const ONLINE_COLOR = "#4BB8E8";
/** Same light fill as untracked slots — idle time is not a separate “category” color */
const IDLE_UNTRACKED_BAR_CLASS =
  "bg-slate-100/70 dark:bg-slate-800/60";
/** Pending offline-time request (awaiting admin) */
const PENDING_OFFLINE_COLOR = "#38BDF8";

function generateMockSlots(): TimeSlotData[] {
  const totalSlots = TOTAL_MINUTES / SLOT_MINUTES;
  const session1 = { start: 0, end: 90 }; // 12:00–1:30
  const session2 = { start: 600, end: 1020 }; // 10:00–17:00

  const slots: TimeSlotData[] = [];
  const mockDayStart = new Date();
  mockDayStart.setHours(0, 0, 0, 0);

  function randomBetween(a: number, b: number): number {
    return a + Math.random() * (b - a);
  }

  for (let i = 0; i < totalSlots; i++) {
    const minStart = i * SLOT_MINUTES;
    const inS1 = minStart >= session1.start && minStart < session1.end;
    const inS2 = minStart >= session2.start && minStart < session2.end;

    const slotStartUtc = new Date(
      mockDayStart.getTime() + minStart * 60 * 1000
    ).toISOString();

    if (inS1 || inS2) {
      let prod: number;
      let neutral: number;
      let unprod: number;
      let idle: number;

      if (inS2) {
        prod = randomBetween(0.65, 1.0);
        neutral = randomBetween(0, (1 - prod) * 0.8);
        unprod = Math.max(0, 1 - prod - neutral);
        if (Math.random() < 0.06) {
          prod = 0;
          neutral = randomBetween(0.3, 0.6);
          unprod = Math.max(0, 1 - neutral);
        }
        idle = Math.random() < 0.15 ? randomBetween(0.05, 0.25) : randomBetween(0, 0.08);
      } else {
        prod = randomBetween(0.3, 0.95);
        neutral = randomBetween(0, (1 - prod) * 0.7);
        unprod = Math.max(0, 1 - prod - neutral);
        idle = randomBetween(0, 0.12);
      }

      const sum = prod + neutral + unprod + idle;
      const nProd = prod / sum;
      const nNeu = neutral / sum;
      const nUn = unprod / sum;
      const nIdle = idle / sum;

      slots.push({
        startMinute: minStart,
        slotStartUtc,
        productivePct: nProd,
        neutralPct: nNeu,
        unproductivePct: nUn,
        idlePct: nIdle,
        idleMs: nIdle * SLOT_MINUTES * 60 * 1000,
        online: true,
      });
    } else {
      slots.push({
        startMinute: minStart,
        slotStartUtc,
        productivePct: 0,
        neutralPct: 0,
        unproductivePct: 0,
        idlePct: 0,
        idleMs: 0,
        online: false,
      });
    }
  }

  return slots;
}

const hourLabels = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

function slotRangeToIsoBounds(slots: TimeSlotData[], lo: number, hi: number) {
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
  const endMs = lastSlotStart + SLOT_MINUTES * 60 * 1000;
  return {
    startIso: new Date(startMs).toISOString(),
    endIso: new Date(endMs).toISOString(),
  };
}

const SLOT_MS = SLOT_MINUTES * 60 * 1000;

/** Support camelCase or snake_case from API serialization. */
function getPendingRangeMs(r: {
  startAt: string;
  endAt: string;
}): { rs: number; re: number } | null {
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

/**
 * Untracked gaps, tracked slots with idle, and not overlapping an existing pending request.
 */
function slotEligibleForOfflineRequest(
  slot: TimeSlotData,
  pendingRanges: { startAt: string; endAt: string }[]
): boolean {
  const baseIdle = !slot.online || slot.idleMs > 0;
  if (!baseIdle) return false;
  if (!pendingRanges.length) return true;
  if (!slot.slotStartUtc) return true;
  const slotStart = new Date(slot.slotStartUtc).getTime();
  const slotEnd = slotStart + SLOT_MS;
  if (Number.isNaN(slotStart)) return true;
  for (const r of pendingRanges) {
    const b = getPendingRangeMs(r);
    if (!b) continue;
    if (slotStart < b.re && slotEnd > b.rs) return false;
  }
  return true;
}

function rangeHasOnlyOfflineEligibleSlots(
  slots: TimeSlotData[],
  lo: number,
  hi: number,
  pendingRanges: { startAt: string; endAt: string }[]
): boolean {
  for (let i = lo; i <= hi; i++) {
    if (!slots[i] || !slotEligibleForOfflineRequest(slots[i], pendingRanges)) {
      return false;
    }
  }
  return true;
}

function mergeMsIntervals(
  intervals: { startMs: number; endMs: number }[]
): { startMs: number; endMs: number }[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.startMs - b.startMs);
  const out: { startMs: number; endMs: number }[] = [];
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

/**
 * Tracked (non-idle) wall-clock within each online slot — placed at the start of the slot.
 * Claimable idle is the remainder; untracked slots have no blocked time.
 */
export function computeBlockedIntervalsFromSlots(
  slots: TimeSlotData[],
  lo: number,
  hi: number
): { start: string; end: string }[] {
  const raw: { startMs: number; endMs: number }[] = [];
  for (let i = lo; i <= hi; i++) {
    const s = slots[i];
    if (!s?.slotStartUtc) continue;
    const slotStart = new Date(s.slotStartUtc).getTime();
    if (!s.online) continue;
    const blockedMs = SLOT_MS - s.idleMs;
    if (blockedMs <= 0) continue;
    raw.push({ startMs: slotStart, endMs: slotStart + blockedMs });
  }
  return mergeMsIntervals(raw).map(({ startMs, endMs }) => ({
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
  }));
}

export const ProductivityTimeline: React.FC<ProductivityTimelineProps> = ({
  slots,
  onOfflineTimeSubmit,
  pendingOfflineRanges = [],
}) => {
  const resolvedSlots = useMemo(() => slots ?? generateMockSlots(), [slots]);

  const pendingSlotIndexSet = useMemo(() => {
    if (!pendingOfflineRanges.length) return new Set<number>();
    const ranges = pendingOfflineRanges
      .map(getPendingRangeMs)
      .filter((x): x is { rs: number; re: number } => x !== null);
    if (!ranges.length) return new Set<number>();

    const set = new Set<number>();
    resolvedSlots.forEach((slot, i) => {
      if (!slot.slotStartUtc) return;
      const slotStart = new Date(slot.slotStartUtc).getTime();
      const slotEnd = slotStart + SLOT_MS;
      if (Number.isNaN(slotStart)) return;
      for (const { rs, re } of ranges) {
        if (slotStart < re && slotEnd > rs) {
          set.add(i);
          break;
        }
      }
    });
    return set;
  }, [resolvedSlots, pendingOfflineRanges]);

  const [dragAnchor, setDragAnchor] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);
  const dragRef = useRef<{ anchor: number; current: number } | null>(null);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [offlineModalRange, setOfflineModalRange] = useState<{
    lo: number;
    hi: number;
  } | null>(null);
  const [offlineSubmitting, setOfflineSubmitting] = useState(false);

  const offlineModalConstraints = useMemo(() => {
    if (!offlineModalRange) return null;
    const { lo, hi } = offlineModalRange;
    const bounds = slotRangeToIsoBounds(resolvedSlots, lo, hi);
    return {
      selectionStartIso: bounds.startIso,
      selectionEndIso: bounds.endIso,
      blockedIntervalsIso: computeBlockedIntervalsFromSlots(
        resolvedSlots,
        lo,
        hi
      ),
    };
  }, [offlineModalRange, resolvedSlots]);

  const selectionLo =
    dragAnchor !== null && dragCurrent !== null
      ? Math.min(dragAnchor, dragCurrent)
      : null;
  const selectionHi =
    dragAnchor !== null && dragCurrent !== null
      ? Math.max(dragAnchor, dragCurrent)
      : null;

  const [hoveredSlot, setHoveredSlot] = useState<TimeSlotData | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  /** Viewport center-x and top-y of the hovered bar (for fixed-position tooltip above the bar). */
  const [tooltipAnchor, setTooltipAnchor] = useState<{ x: number; y: number } | null>(
    null
  );
  const hoveredBarElRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const anchorFromBarElement = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    hoveredBarElRef.current = el;
    const r = el.getBoundingClientRect();
    setTooltipAnchor({ x: r.left + r.width / 2, y: r.top });
  }, []);

  const handleBarHover = useCallback(
    (slot: TimeSlotData, el: HTMLElement, index: number) => {
      setHoveredSlot(slot);
      setHoveredBarIndex(index);
      anchorFromBarElement(el);
    },
    [anchorFromBarElement]
  );

  const handleBarMove = useCallback(
    (el: HTMLElement) => {
      anchorFromBarElement(el);
    },
    [anchorFromBarElement]
  );

  const handleBarLeave = useCallback(() => {
    setHoveredSlot(null);
    setHoveredBarIndex(null);
    setTooltipAnchor(null);
    hoveredBarElRef.current = null;
  }, []);

  useEffect(() => {
    if (!hoveredSlot) return;

    const updateFromHoveredBar = () => {
      if (hoveredBarElRef.current) {
        const r = hoveredBarElRef.current.getBoundingClientRect();
        setTooltipAnchor({ x: r.left + r.width / 2, y: r.top });
      }
    };

    window.addEventListener("scroll", updateFromHoveredBar, true);
    window.addEventListener("resize", updateFromHoveredBar);
    const sc = scrollContainerRef.current;
    sc?.addEventListener("scroll", updateFromHoveredBar, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateFromHoveredBar, true);
      window.removeEventListener("resize", updateFromHoveredBar);
      sc?.removeEventListener("scroll", updateFromHoveredBar);
    };
  }, [hoveredSlot]);

  const barsContainerRef = useRef<HTMLDivElement | null>(null);

  const clientXToSlotIndex = useCallback(
    (clientX: number): number | null => {
      const el = barsContainerRef.current;
      if (!el || resolvedSlots.length === 0) return null;
      const rect = el.getBoundingClientRect();
      const step = SLOT_BAR_WIDTH_PX + SLOT_BAR_GAP_PX;
      const x = clientX - rect.left + el.scrollLeft;
      const idx = Math.floor(x / step);
      if (idx < 0 || idx >= resolvedSlots.length) return null;
      return idx;
    },
    [resolvedSlots.length]
  );

  useEffect(() => {
    if (dragAnchor === null) return;

    const onMove = (e: PointerEvent) => {
      const idx = clientXToSlotIndex(e.clientX);
      if (idx === null || !dragRef.current) return;
      dragRef.current.current = idx;
      setDragCurrent(idx);
    };

    const onUp = () => {
      const d = dragRef.current;
      dragRef.current = null;
      setDragAnchor(null);
      setDragCurrent(null);
      if (!d || !onOfflineTimeSubmit) return;
      const lo = Math.min(d.anchor, d.current);
      const hi = Math.max(d.anchor, d.current);
      if (
        rangeHasOnlyOfflineEligibleSlots(
          resolvedSlots,
          lo,
          hi,
          pendingOfflineRanges
        )
      ) {
        setOfflineModalRange({ lo, hi });
        setOfflineModalOpen(true);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [
    dragAnchor,
    onOfflineTimeSubmit,
    resolvedSlots,
    clientXToSlotIndex,
    pendingOfflineRanges,
  ]);

  const yTicks = ["100%", "75%", "50%", "25%", ""];

  const slotCount = resolvedSlots.length;
  const barTrackMinWidth =
    slotCount > 0
      ? slotCount * (SLOT_BAR_WIDTH_PX + SLOT_BAR_GAP_PX) - SLOT_BAR_GAP_PX
      : 0;

  return (
    <div className="space-y-3">
      <div className="text-md font-medium text-slate-900 dark:text-slate-100">
        Productivity Timeline
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <LegendDot color={PRODUCTIVE_COLOR} label="Productive" />
        <LegendDot color={NEUTRAL_COLOR} label="Neutral" />
        <LegendDot color={UNPRODUCTIVE_COLOR} label="Unproductive" />
        <LegendDot
          dotClassName={IDLE_UNTRACKED_BAR_CLASS}
          label="Idle / untracked"
        />
        <LegendDot color={ONLINE_COLOR} label="Online" />
        {pendingOfflineRanges.length > 0 ? (
          <LegendDot
            color={PENDING_OFFLINE_COLOR}
            label="Pending offline request"
          />
        ) : null}
      </div>
      {onOfflineTimeSubmit ? (
        <p className="text-xs text-slate-500">
          Drag across <span className="font-medium text-slate-700">idle</span>{" "}
          time or <span className="font-medium text-slate-700">untracked</span>{" "}
          gaps (no activity). Sky blue slots already have a pending request and
          cannot be selected again until approved or declined.
        </p>
      ) : null}

      <div
        ref={scrollContainerRef}
        className="timeline-h-scrollbar-thin overflow-x-auto"
      >
        <div className="flex w-max min-w-[1100px] gap-3">
          {/* Y Axis */}
          <div className="flex h-32 flex-col justify-between pb-5 pr-1 text-xs text-slate-400 dark:text-slate-500">
            {yTicks.map((tick) => (
              <div key={tick} className="text-right">
                {tick}
              </div>
            ))}
          </div>

          {/* Chart area: minWidth matches bar track so flex never squeezes bars below SLOT_BAR_WIDTH_PX */}
          <div
            className="relative flex-1"
            style={{ minWidth: barTrackMinWidth }}
          >
          <div className="pointer-events-none absolute inset-0 rounded border border-dashed border-slate-200 dark:border-slate-700" />

          {/* Bars */}
          <div className="relative border-b border-slate-200/70 dark:border-slate-700/70">
            <div
              ref={barsContainerRef}
              className="flex h-32 flex-nowrap items-end"
              style={{
                gap: SLOT_BAR_GAP_PX,
                minWidth: barTrackMinWidth,
              }}
            >
              {resolvedSlots.map((slot, index) => (
                <SlotBar
                  key={`timeline-bar-${index}`}
                  slot={slot}
                  index={index}
                  barWidthPx={SLOT_BAR_WIDTH_PX}
                  selected={
                    selectionLo !== null &&
                    selectionHi !== null &&
                    index >= selectionLo &&
                    index <= selectionHi
                  }
                  pendingOverlay={pendingSlotIndexSet.has(index)}
                  eligible={slotEligibleForOfflineRequest(
                    slot,
                    pendingOfflineRanges
                  )}
                  enableOfflineDrag={!!onOfflineTimeSubmit}
                  onHover={handleBarHover}
                  onHoverMove={handleBarMove}
                  onLeave={handleBarLeave}
                  onDragPointerDown={(idx) => {
                    if (
                      !onOfflineTimeSubmit ||
                      !slotEligibleForOfflineRequest(slot, pendingOfflineRanges)
                    )
                      return;
                    dragRef.current = { anchor: idx, current: idx };
                    setDragAnchor(idx);
                    setDragCurrent(idx);
                  }}
                />
              ))}
            </div>
          </div>

            {/* Online band */}
            <div
              className="mt-0.5 flex h-2 flex-nowrap"
              style={{ gap: SLOT_BAR_GAP_PX, minWidth: barTrackMinWidth }}
            >
              {resolvedSlots.map((slot, index) => (
                <div
                  key={`timeline-online-${index}`}
                  className="h-2 flex-shrink-0 rounded-b-[2px]"
                  style={{
                    width: SLOT_BAR_WIDTH_PX,
                    backgroundColor: slot.online ? ONLINE_COLOR : "transparent",
                  }}
                />
              ))}
            </div>

            {/* X axis labels */}
            <div className="relative mt-1 h-4 text-xs text-slate-400 dark:text-slate-500">
              {hourLabels.map((h) => {
                const pct = (h * 60 * 100) / TOTAL_MINUTES;
                let label = "";
                if (h === 0) label = "12 AM";
                else if (h === 12) label = "12 PM";
                else if (h < 12) label = `${h} AM`;
                else if (h === 24) label = "";
                else label = `${h - 12} PM`;

                const isFirst = h === 0;
                const isLast = h === 24;

                const style: React.CSSProperties = isFirst
                  ? { left: `${pct}%`, transform: "translateX(0)" }
                  : isLast
                  ? { right: 0, transform: "translateX(0)" }
                  : { left: `${pct}%`, transform: "translateX(-50%)" };

                return (
                  <div
                    key={h}
                    className="absolute whitespace-nowrap"
                    style={style}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed to viewport so it stays above the hovered bar while the chart scrolls horizontally */}
      {hoveredSlot && tooltipAnchor && (
        <div
          className="pointer-events-none fixed z-[100] max-w-xs rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900 shadow-md"
          style={{
            left: tooltipAnchor.x,
            top: tooltipAnchor.y,
            transform: "translate(-50%, calc(-100% - 8px))",
          }}
        >
          <div className="font-medium text-gray-900">
            {formatSlotRange(hoveredSlot.startMinute)}
          </div>
          <div className="mt-0.5 space-y-0.5 text-gray-600">
            {hoveredBarIndex !== null &&
            pendingSlotIndexSet.has(hoveredBarIndex) ? (
              <div className="font-medium text-sky-700">
                Pending offline request — select a different time
              </div>
            ) : null}
            {!hoveredSlot.online ? (
              <div className="text-gray-700">No tracked activity — untracked time</div>
            ) : (
              <>
                <div>
                  Productive {(hoveredSlot.productivePct * 100).toFixed(0)}% (
                  {(SLOT_MINUTES * hoveredSlot.productivePct).toFixed(1)}m)
                </div>
                <div>
                  Neutral {(hoveredSlot.neutralPct * 100).toFixed(0)}% (
                  {(SLOT_MINUTES * hoveredSlot.neutralPct).toFixed(1)}m)
                </div>
                <div>
                  Unproductive {(hoveredSlot.unproductivePct * 100).toFixed(0)}% (
                  {(SLOT_MINUTES * hoveredSlot.unproductivePct).toFixed(1)}m)
                </div>
                <div>
                  Idle {(hoveredSlot.idlePct * 100).toFixed(0)}% (
                  {(SLOT_MINUTES * hoveredSlot.idlePct).toFixed(1)}m)
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {offlineModalRange && offlineModalConstraints && onOfflineTimeSubmit ? (
        <OfflineTimeRequestModal
          isOpen={offlineModalOpen}
          onClose={() => {
            setOfflineModalOpen(false);
            setOfflineModalRange(null);
          }}
          {...offlineModalConstraints}
          pendingOfflineRangesIso={pendingOfflineRanges}
          isSubmitting={offlineSubmitting}
          onSubmit={async (payload) => {
            setOfflineSubmitting(true);
            try {
              await onOfflineTimeSubmit(payload);
              setOfflineModalOpen(false);
              setOfflineModalRange(null);
            } finally {
              setOfflineSubmitting(false);
            }
          }}
        />
      ) : null}
    </div>
  );
};

const LegendDot: React.FC<{
  color?: string;
  dotClassName?: string;
  label: string;
}> = ({ color, dotClassName, label }) => (
  <div className="flex items-center gap-1">
    <span
      className={cn("h-2.5 w-2.5 rounded-[3px]", dotClassName)}
      style={dotClassName ? undefined : { backgroundColor: color }}
    />
    <span>{label}</span>
  </div>
);

const SlotBar: React.FC<{
  slot: TimeSlotData;
  index: number;
  barWidthPx: number;
  selected: boolean;
  pendingOverlay?: boolean;
  eligible: boolean;
  enableOfflineDrag: boolean;
  onHover: (slot: TimeSlotData, element: HTMLElement, index: number) => void;
  onHoverMove: (element: HTMLElement) => void;
  onLeave: () => void;
  onDragPointerDown: (index: number) => void;
}> = ({
  slot,
  index,
  barWidthPx,
  selected,
  pendingOverlay = false,
  eligible,
  enableOfflineDrag,
  onHover,
  onHoverMove,
  onLeave,
  onDragPointerDown,
}) => {
  const barStyle = { width: barWidthPx, flexShrink: 0 as const };

  if (!slot.online) {
    return (
      <div
        className={cn(
          "relative h-32 flex-col rounded-t-[2px] border border-transparent",
          "bg-slate-100/70 dark:bg-slate-800/60",
          enableOfflineDrag && eligible && "cursor-grab active:cursor-grabbing",
          selected && eligible && "border-emerald-500 ring-1 ring-emerald-400"
        )}
        style={barStyle}
        onMouseEnter={(e) => onHover(slot, e.currentTarget, index)}
        onMouseMove={(e) => onHoverMove(e.currentTarget)}
        onMouseLeave={onLeave}
        onPointerDown={(e) => {
          if (!enableOfflineDrag || !eligible) return;
          e.preventDefault();
          onDragPointerDown(index);
        }}
      >
        {pendingOverlay ? (
          <div
            className="pointer-events-none absolute inset-0 z-[5] rounded-t-[2px] bg-sky-400/40 ring-1 ring-inset ring-sky-400/55 dark:bg-sky-500/35"
            aria-hidden
            title="Pending offline request — cannot submit again for this time"
          />
        ) : null}
      </div>
    );
  }

  const t =
    slot.productivePct +
    slot.neutralPct +
    slot.unproductivePct +
    slot.idlePct;
  const scale = t > 0 ? 100 / t : 0;
  const unprodHeight = Math.round(slot.unproductivePct * scale);
  const neutralHeight = Math.round(slot.neutralPct * scale);
  const prodHeight = Math.round(slot.productivePct * scale);
  const idleHeight = Math.max(0, Math.round(slot.idlePct * scale));

  return (
    <div
      className={cn(
        "relative flex h-32 touch-none flex-col justify-end overflow-hidden rounded-t-[2px] border border-transparent",
        enableOfflineDrag && eligible && "cursor-grab active:cursor-grabbing",
        selected && eligible && "border-emerald-500 ring-1 ring-emerald-400"
      )}
      style={barStyle}
      onMouseEnter={(e) => onHover(slot, e.currentTarget, index)}
      onMouseMove={(e) => onHoverMove(e.currentTarget)}
      onMouseLeave={onLeave}
      onPointerDown={(e) => {
        if (!enableOfflineDrag || !eligible) return;
        e.preventDefault();
        onDragPointerDown(index);
      }}
    >
      {unprodHeight > 0 && (
        <div
          className="w-full flex-shrink-0"
          style={{
            height: `${unprodHeight}%`,
            backgroundColor: UNPRODUCTIVE_COLOR,
          }}
        />
      )}
      {neutralHeight > 0 && (
        <div
          className="w-full flex-shrink-0"
          style={{
            height: `${neutralHeight}%`,
            backgroundColor: NEUTRAL_COLOR,
          }}
        />
      )}
      {prodHeight > 0 && (
        <div
          className="w-full flex-shrink-0"
          style={{
            height: `${prodHeight}%`,
            backgroundColor: PRODUCTIVE_COLOR,
          }}
        />
      )}
      {idleHeight > 0 && (
        <div
          className={cn(
            "w-full flex-shrink-0",
            IDLE_UNTRACKED_BAR_CLASS
          )}
          style={{ height: `${idleHeight}%` }}
        />
      )}
      {pendingOverlay ? (
        <div
          className="pointer-events-none absolute inset-0 z-[5] rounded-t-[2px] bg-sky-400/40 ring-1 ring-inset ring-sky-400/55 dark:bg-sky-500/35"
          aria-hidden
          title="Pending offline request — cannot submit again for this time"
        />
      ) : null}
    </div>
  );
};

export default ProductivityTimeline;

function formatSlotRange(startMinute: number): string {
  const startH = Math.floor(startMinute / 60);
  const startM = startMinute % 60;
  const endMinute = startMinute + SLOT_MINUTES;
  const endH = Math.floor(endMinute / 60);
  const endM = endMinute % 60;

  const format = (h: number, m: number) => {
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const mm = m.toString().padStart(2, "0");
    return `${hour12}:${mm} ${suffix}`;
  };

  return `${format(startH, startM)} – ${format(endH, endM)}`;
}

