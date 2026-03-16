"use client";

import React, { useMemo, useState } from "react";

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
  productivePct: number;
  neutralPct: number;
  unproductivePct: number;
  online: boolean;
};

export interface ProductivityTimelineProps {
  /**
   * Optional array of time slots. When omitted, the component renders
   * a realistic mock workday using two sessions similar to Desktime's demo.
   */
  slots?: TimeSlotData[];
}

const TOTAL_MINUTES = 24 * 60;
const SLOT_MINUTES = 5;

// Colors aligned with the provided design and existing palette
const PRODUCTIVE_COLOR = "#6BBF4E";
const NEUTRAL_COLOR = "#D0D0D0";
const UNPRODUCTIVE_COLOR = "#E07A5F";
const ONLINE_COLOR = "#4BB8E8";

function generateMockSlots(): TimeSlotData[] {
  const totalSlots = TOTAL_MINUTES / SLOT_MINUTES;
  const session1 = { start: 0, end: 90 }; // 12:00–1:30
  const session2 = { start: 600, end: 1020 }; // 10:00–17:00

  const slots: TimeSlotData[] = [];

  function randomBetween(a: number, b: number): number {
    return a + Math.random() * (b - a);
  }

  for (let i = 0; i < totalSlots; i++) {
    const minStart = i * SLOT_MINUTES;
    const inS1 = minStart >= session1.start && minStart < session1.end;
    const inS2 = minStart >= session2.start && minStart < session2.end;

    if (inS1 || inS2) {
      let prod: number;
      let neutral: number;
      let unprod: number;

      if (inS2) {
        prod = randomBetween(0.65, 1.0);
        neutral = randomBetween(0, (1 - prod) * 0.8);
        unprod = Math.max(0, 1 - prod - neutral);
        if (Math.random() < 0.06) {
          prod = 0;
          neutral = randomBetween(0.3, 0.6);
          unprod = Math.max(0, 1 - neutral);
        }
      } else {
        prod = randomBetween(0.3, 0.95);
        neutral = randomBetween(0, (1 - prod) * 0.7);
        unprod = Math.max(0, 1 - prod - neutral);
      }

      slots.push({
        startMinute: minStart,
        productivePct: prod,
        neutralPct: neutral,
        unproductivePct: unprod,
        online: true,
      });
    } else {
      slots.push({
        startMinute: minStart,
        productivePct: 0,
        neutralPct: 0,
        unproductivePct: 0,
        online: false,
      });
    }
  }

  return slots;
}

const hourLabels = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

export const ProductivityTimeline: React.FC<ProductivityTimelineProps> = ({
  slots,
}) => {
  const resolvedSlots = useMemo(() => slots ?? generateMockSlots(), [slots]);

  const [hoveredSlot, setHoveredSlot] = useState<TimeSlotData | null>(null);

  const yTicks = ["100%", "75%", "50%", "25%", ""];

  return (
    <div className="space-y-3">
      <div className="text-md font-medium text-slate-900 dark:text-slate-100">
        Productivity Timeline
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <LegendDot color={PRODUCTIVE_COLOR} label="Productive" />
        <LegendDot color={NEUTRAL_COLOR} label="Neutral" />
        <LegendDot color={UNPRODUCTIVE_COLOR} label="Unproductive" />
        <LegendDot color={ONLINE_COLOR} label="Online" />
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[1100px] gap-3">
          {/* Y Axis */}
          <div className="flex h-32 flex-col justify-between pb-5 pr-1 text-xs text-slate-400 dark:text-slate-500">
            {yTicks.map((tick) => (
              <div key={tick} className="text-right">
                {tick}
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 rounded border border-dashed border-slate-200 dark:border-slate-700" />

          {/* Hover tooltip (overlay, does not affect layout) */}
          {hoveredSlot && (
            <div className="pointer-events-none absolute left-2 top-2 z-10 max-w-xs rounded-md bg-slate-900 px-2 py-1 text-[11px] text-slate-50 shadow-sm dark:bg-slate-800">
              <div className="font-medium">
                {formatSlotRange(hoveredSlot.startMinute)}
              </div>
              <div className="mt-0.5 space-y-0.5 text-slate-300">
                <div>
                  Productive{" "}
                  {(hoveredSlot.productivePct * 100).toFixed(0)}% (
                  {(SLOT_MINUTES * hoveredSlot.productivePct).toFixed(1)}m)
                </div>
                <div>
                  Neutral {(hoveredSlot.neutralPct * 100).toFixed(0)}% (
                  {(SLOT_MINUTES * hoveredSlot.neutralPct).toFixed(1)}m)
                </div>
                <div>
                  Unproductive{" "}
                  {(hoveredSlot.unproductivePct * 100).toFixed(0)}% (
                  {(SLOT_MINUTES * hoveredSlot.unproductivePct).toFixed(1)}m)
                </div>
              </div>
            </div>
          )}

          {/* Bars */}
          <div className="relative border-b border-slate-200/70 dark:border-slate-700/70">
            <div className="flex h-32 items-end gap-[2px]">
              {resolvedSlots.map((slot) => (
                <SlotBar
                  key={slot.startMinute}
                  slot={slot}
                  onHover={setHoveredSlot}
                  onLeave={() => setHoveredSlot(null)}
                />
              ))}
            </div>
          </div>

            {/* Online band */}
            <div className="mt-0.5 flex h-2 gap-[2px]">
              {resolvedSlots.map((slot) => (
                <div
                  key={slot.startMinute}
                  className="h-2 w-[3px] flex-1 rounded-b-[2px]"
                  style={{
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
    </div>
  );
};

const LegendDot: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <div className="flex items-center gap-1">
    <span
      className="h-2.5 w-2.5 rounded-[3px]"
      style={{ backgroundColor: color }}
    />
    <span>{label}</span>
  </div>
);

const SlotBar: React.FC<{
  slot: TimeSlotData;
  onHover: (slot: TimeSlotData) => void;
  onLeave: () => void;
}> = ({ slot, onHover, onLeave }) => {
  if (!slot.online) {
    return (
      <div
        className="h-32 w-[15px] flex-1"
        onMouseEnter={() => onHover(slot)}
        onMouseLeave={onLeave}
      />
    );
  }

  const prodHeight = Math.round(slot.productivePct * 100);
  const neutralHeight = Math.round(slot.neutralPct * 100);
  const unprodHeight = Math.round(slot.unproductivePct * 100);

  const prodMinutes = SLOT_MINUTES * slot.productivePct;
  const neutralMinutes = SLOT_MINUTES * slot.neutralPct;
  const unprodMinutes = SLOT_MINUTES * slot.unproductivePct;

  return (
    <div
      className="flex h-32 w-[15px] flex-1 flex-col justify-end overflow-hidden rounded-t-[2px]"
      onMouseEnter={() => onHover(slot)}
      onMouseLeave={onLeave}
    >
      {/* Stack from bottom: unproductive, neutral, productive */}
      {unprodHeight > 0 && (
        <div
          className="w-full flex-shrink-0"
          style={{ height: `${unprodHeight}%`, backgroundColor: UNPRODUCTIVE_COLOR }}
        />
      )}
      {neutralHeight > 0 && (
        <div
          className="w-full flex-shrink-0"
          style={{ height: `${neutralHeight}%`, backgroundColor: NEUTRAL_COLOR }}
        />
      )}
      {prodHeight > 0 && (
        <div
          className="w-full flex-shrink-0"
          style={{ height: `${prodHeight}%`, backgroundColor: PRODUCTIVE_COLOR }}
        />
      )}
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

