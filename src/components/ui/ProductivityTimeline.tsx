"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { OfflineTimeRequestModal } from "@/components/ui/OfflineTimeRequestModal";
import { formatDuration } from "@/services/dashboardStats";
import {
  computeClaimableIntervalsIso,
  getPendingRangeMs,
  getSlotFractions,
  mergeBlockedIntervalsIsoForWindow,
  slotRangeToIsoBounds,
  TIMELINE_SLOT_MS,
} from "@/utils/offline-claim";
import { cn } from "@/utils/tw";

export { computeBlockedIntervalsFromSlots, getSlotFractions } from "@/utils/offline-claim";

/**
 * Represents a single 5-minute time slot in the productivity timeline.
 * `startMinute` is minutes from midnight (0–1435) and percentages are 0–1.
 *
 * Fractions of the 5‑minute slot (each 0–1; they need not sum to 1 if part of
 * the slot has no events). The bar renders each fraction as that share of the
 * column height; the remainder is untracked/empty — do **not** renormalize
 * categories to fill 100% when sum < 1.
 * - online           = true when there is any tracked activity in the slot
 */
export type TimelineSlotActivity = {
  label: string;
  durationMs: number;
  category: "productive" | "neutral" | "unproductive";
};

export type TimelineIntervalIso = { start: string; end: string };

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
  /** Apps/sites contributing active time in this slot (from API; tooltip breakdown). */
  activities?: TimelineSlotActivity[];
  /**
   * Wall-clock intervals from worker (optional for legacy timelines).
   * When all slots in a selection include these, blocked intervals use merged active time only.
   */
  activeIntervalsUtc?: TimelineIntervalIso[];
  idleIntervalsUtc?: TimelineIntervalIso[];
  remainderIntervalsUtc?: TimelineIntervalIso[];
};

export interface ProductivityTimelineProps {
  /**
   * Optional array of time slots. When omitted, the component renders
   * a realistic mock workday using two sessions similar to Desktime's demo.
   */
  slots?: TimeSlotData[];
  /** When set, user can drag-select a range and submit offline-time request(s) for claimable segments. */
  onOfflineTimeSubmit?: (payload: {
    segments: { startAt: string; endAt: string }[];
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

      const demoActivities: TimelineSlotActivity[] | undefined =
        inS2 && Math.random() > 0.72
          ? [
              {
                label: "Cursor",
                durationMs: Math.round(40000 + Math.random() * 80000),
                category: "productive",
              },
              {
                label: "Google Chrome",
                durationMs: Math.round(20000 + Math.random() * 50000),
                category: "productive",
              },
              {
                label: "DBeaver",
                durationMs: Math.round(10000 + Math.random() * 40000),
                category: "neutral",
              },
            ]
          : undefined;

      slots.push({
        startMinute: minStart,
        slotStartUtc,
        productivePct: nProd,
        neutralPct: nNeu,
        unproductivePct: nUn,
        idlePct: nIdle,
        idleMs: nIdle * SLOT_MINUTES * 60 * 1000,
        online: true,
        activities: demoActivities,
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

const SLOT_MS = TIMELINE_SLOT_MS;

/** Rounds to nearest ms so tooltip/Y-axis match wall-clock slot math. */
function slotFractionToDurationLabel(pct: number): string {
  return formatDuration(Math.round(SLOT_MS * pct));
}

const TIMELINE_Y_AXIS_TICKS: string[] = [1, 0.75, 0.5, 0.25, 0].map((f) =>
  f === 0 ? "" : formatDuration(Math.round(SLOT_MS * f)),
);

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
      blockedIntervalsIso: mergeBlockedIntervalsIsoForWindow(
        resolvedSlots,
        lo,
        hi,
        pendingOfflineRanges,
      ),
      claimableSegmentsIso: computeClaimableIntervalsIso(
        resolvedSlots,
        lo,
        hi,
        pendingOfflineRanges,
      ),
    };
  }, [offlineModalRange, resolvedSlots, pendingOfflineRanges]);

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

  const hoveredSlotFractions = useMemo(() => {
    if (!hoveredSlot?.online) return null;
    return getSlotFractions(hoveredSlot);
  }, [hoveredSlot]);

  const hoveredSlotTotalTrackedMs = useMemo(() => {
    if (!hoveredSlotFractions) return 0;
    const f = hoveredSlotFractions;
    return Math.round(
      (f.productivePct +
        f.neutralPct +
        f.unproductivePct +
        f.idlePct) *
        SLOT_MS
    );
  }, [hoveredSlotFractions]);

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
      const claimable = computeClaimableIntervalsIso(
        resolvedSlots,
        lo,
        hi,
        pendingOfflineRanges,
      );
      if (claimable.length === 0) {
        toast.error("No claimable idle or untracked time in this selection.");
        return;
      }
      setOfflineModalRange({ lo, hi });
      setOfflineModalOpen(true);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragAnchor, onOfflineTimeSubmit, resolvedSlots, clientXToSlotIndex, pendingOfflineRanges]);

  const yTicks = TIMELINE_Y_AXIS_TICKS;

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
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Each column = {SLOT_MINUTES} min clock; stack height matches time in that window.
        </span>
        {pendingOfflineRanges.length > 0 ? (
          <LegendDot
            color={PENDING_OFFLINE_COLOR}
            label="Pending offline request"
          />
        ) : null}
      </div>
      {onOfflineTimeSubmit ? (
        <p className="text-xs text-slate-500">
          Drag across any part of the timeline to select a range. Claimable time
          (idle or untracked, not active work) appears in the request dialog,
          where you can exclude segments before submitting. Sky blue slots
          already have a pending request overlapping that time.
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
                  enableOfflineDrag={!!onOfflineTimeSubmit}
                  onHover={handleBarHover}
                  onHoverMove={handleBarMove}
                  onLeave={handleBarLeave}
                  onDragPointerDown={(idx) => {
                    if (!onOfflineTimeSubmit) return;
                    dragRef.current = { anchor: idx, current: idx };
                    setDragAnchor(idx);
                    setDragCurrent(idx);
                  }}
                />
              ))}
            </div>
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
          className="pointer-events-none fixed z-[100] min-w-[220px] max-w-sm rounded-md border border-gray-200 bg-white px-2.5 py-2 text-[11px] text-gray-900 shadow-md dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          style={{
            left: tooltipAnchor.x,
            top: tooltipAnchor.y,
            transform: "translate(-50%, calc(-100% - 8px))",
          }}
        >
          <div className="font-semibold text-gray-900 dark:text-slate-50">
            {formatSlotRange(hoveredSlot.startMinute)}
          </div>
          <div className="mt-1 space-y-1 text-gray-600 dark:text-slate-300">
            {hoveredBarIndex !== null &&
            pendingSlotIndexSet.has(hoveredBarIndex) ? (
              <div className="font-medium text-sky-700 dark:text-sky-400">
                Pending offline request — select a different time
              </div>
            ) : null}
            {!hoveredSlot.online ? (
              <div className="text-gray-700 dark:text-slate-300">
                No tracked activity — untracked time
              </div>
            ) : hoveredSlotFractions ? (
              <>
                <div className="border-b border-gray-100 pb-1.5 text-gray-700 dark:border-slate-700 dark:text-slate-300">
                  <div>
                    Categorized:{" "}
                    {slotFractionToDurationLabel(
                      hoveredSlotFractions.productivePct +
                        hoveredSlotFractions.neutralPct +
                        hoveredSlotFractions.unproductivePct +
                        hoveredSlotFractions.idlePct,
                    )}
                  </div>
                  {hoveredSlotFractions.remainderPct > 0.001 ? (
                    <div>
                      No activity:{" "}
                      {slotFractionToDurationLabel(
                        hoveredSlotFractions.remainderPct,
                      )}{" "}
                      <span className="text-gray-400 dark:text-slate-500">
                        (
                        {(hoveredSlotFractions.remainderPct * 100).toFixed(1)}
                        % of slot)
                      </span>
                    </div>
                  ) : null}
                  <div className="text-[10px] text-gray-400 dark:text-slate-500">
                    Slot wall clock: {formatDuration(SLOT_MS)}
                  </div>
                </div>
                {hoveredSlotFractions.productivePct > 0.001 ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block size-2 shrink-0 rounded-sm"
                        style={{ backgroundColor: PRODUCTIVE_COLOR }}
                        aria-hidden
                      />
                      <span className="lowercase">productive</span>
                    </span>
                    <span className="shrink-0 text-right tabular-nums text-gray-900 dark:text-slate-100">
                      {(hoveredSlotFractions.productivePct * 100).toFixed(0)}%
                      <span className="text-gray-500 dark:text-slate-400">
                        {" "}
                        · {slotFractionToDurationLabel(
                          hoveredSlotFractions.productivePct,
                        )}
                      </span>
                    </span>
                  </div>
                ) : null}
                {hoveredSlotFractions.neutralPct > 0.001 ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block size-2 shrink-0 rounded-sm"
                        style={{ backgroundColor: NEUTRAL_COLOR }}
                        aria-hidden
                      />
                      <span className="lowercase">neutral</span>
                    </span>
                    <span className="shrink-0 text-right tabular-nums text-gray-900 dark:text-slate-100">
                      {(hoveredSlotFractions.neutralPct * 100).toFixed(0)}%
                      <span className="text-gray-500 dark:text-slate-400">
                        {" "}
                        · {slotFractionToDurationLabel(
                          hoveredSlotFractions.neutralPct,
                        )}
                      </span>
                    </span>
                  </div>
                ) : null}
                {hoveredSlotFractions.unproductivePct > 0.001 ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block size-2 shrink-0 rounded-sm"
                        style={{ backgroundColor: UNPRODUCTIVE_COLOR }}
                        aria-hidden
                      />
                      <span className="lowercase">unproductive</span>
                    </span>
                    <span className="shrink-0 text-right tabular-nums text-gray-900 dark:text-slate-100">
                      {(hoveredSlotFractions.unproductivePct * 100).toFixed(0)}%
                      <span className="text-gray-500 dark:text-slate-400">
                        {" "}
                        · {slotFractionToDurationLabel(
                          hoveredSlotFractions.unproductivePct,
                        )}
                      </span>
                    </span>
                  </div>
                ) : null}
                {hoveredSlotFractions.idlePct > 0.001 ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block size-2 shrink-0 rounded-sm bg-slate-200 dark:bg-slate-600"
                        aria-hidden
                      />
                      <span className="lowercase">idle</span>
                    </span>
                    <span className="shrink-0 text-right tabular-nums text-gray-900 dark:text-slate-100">
                      {(hoveredSlotFractions.idlePct * 100).toFixed(0)}%
                      <span className="text-gray-500 dark:text-slate-400">
                        {" "}
                        · {slotFractionToDurationLabel(hoveredSlotFractions.idlePct)}
                      </span>
                    </span>
                  </div>
                ) : null}
                {hoveredSlot.activities && hoveredSlot.activities.length > 0 ? (
                  <div className="mt-1.5 border-t border-gray-100 pt-1.5 dark:border-slate-700">
                    <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">
                      Apps & sites
                    </div>
                    <ul className="grid max-h-40 gap-y-0.5 overflow-y-auto pr-0.5">
                      {hoveredSlot.activities.map((a, idx) => (
                        <li
                          key={`${a.label}-${idx}`}
                          className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-0.5"
                        >
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span
                              className="inline-block size-1.5 shrink-0 rounded-sm"
                              style={{
                                backgroundColor:
                                  a.category === "productive"
                                    ? PRODUCTIVE_COLOR
                                    : a.category === "unproductive"
                                      ? UNPRODUCTIVE_COLOR
                                      : NEUTRAL_COLOR,
                              }}
                              aria-hidden
                            />
                            <span className="truncate">{a.label}</span>
                          </span>
                          <span className="shrink-0 tabular-nums text-gray-800 dark:text-slate-200">
                            {formatDuration(Math.round(a.durationMs))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="mt-1.5 border-t border-gray-100 pt-1.5 font-semibold text-gray-900 dark:border-slate-700 dark:text-slate-100">
                  Total: {formatDuration(hoveredSlotTotalTrackedMs)}
                </div>
              </>
            ) : null}
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
          enableOfflineDrag && "cursor-grab active:cursor-grabbing",
          selected && enableOfflineDrag && "border-emerald-500 ring-1 ring-emerald-400"
        )}
        style={barStyle}
        onMouseEnter={(e) => onHover(slot, e.currentTarget, index)}
        onMouseMove={(e) => onHoverMove(e.currentTarget)}
        onMouseLeave={onLeave}
        onPointerDown={(e) => {
          if (!enableOfflineDrag) return;
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

  const {
    productivePct: p,
    neutralPct: n,
    unproductivePct: u,
    idlePct: i,
    remainderPct: remainder,
  } = getSlotFractions(slot);

  return (
    <div
      className={cn(
        "relative flex h-32 touch-none flex-col overflow-hidden rounded-t-[2px] border border-transparent",
        enableOfflineDrag && "cursor-grab active:cursor-grabbing",
        selected && enableOfflineDrag && "border-emerald-500 ring-1 ring-emerald-400"
      )}
      style={barStyle}
      onMouseEnter={(e) => onHover(slot, e.currentTarget, index)}
      onMouseMove={(e) => onHoverMove(e.currentTarget)}
      onMouseLeave={onLeave}
      onPointerDown={(e) => {
        if (!enableOfflineDrag) return;
        e.preventDefault();
        onDragPointerDown(index);
      }}
    >
      {/* Top: portion of slot with no recorded activity (same look as idle/untracked) */}
      {remainder > 0.001 && (
        <div
          className={cn("w-full min-h-0", IDLE_UNTRACKED_BAR_CLASS)}
          style={{ flexGrow: remainder, flexShrink: 0, flexBasis: 0 }}
          title="No activity in this part of the 5‑minute slot"
        />
      )}
      {/* Stack fills rest: idle, then categories toward bottom (unproductive at baseline) */}
      {i > 0.001 && (
        <div
          className={cn("w-full min-h-0", IDLE_UNTRACKED_BAR_CLASS)}
          style={{ flexGrow: i, flexShrink: 0, flexBasis: 0 }}
        />
      )}
      {p > 0.001 && (
        <div
          className="w-full min-h-0 flex-shrink-0"
          style={{
            flexGrow: p,
            flexShrink: 0,
            flexBasis: 0,
            backgroundColor: PRODUCTIVE_COLOR,
          }}
        />
      )}
      {n > 0.001 && (
        <div
          className="w-full min-h-0 flex-shrink-0"
          style={{
            flexGrow: n,
            flexShrink: 0,
            flexBasis: 0,
            backgroundColor: NEUTRAL_COLOR,
          }}
        />
      )}
      {u > 0.001 && (
        <div
          className="w-full min-h-0 flex-shrink-0"
          style={{
            flexGrow: u,
            flexShrink: 0,
            flexBasis: 0,
            backgroundColor: UNPRODUCTIVE_COLOR,
          }}
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

