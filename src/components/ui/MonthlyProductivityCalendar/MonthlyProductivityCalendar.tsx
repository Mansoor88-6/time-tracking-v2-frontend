"use client";

import { useMemo } from "react";
import { formatDuration, type MonthOverviewDay } from "@/services/dashboardStats";

/** 24h display for calendar cells (e.g. 14:45), local time. */
function formatTime24Local(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h}:${String(m).padStart(2, "0")}`;
}

function isArrivalLate(
  arrivalIso: string | null,
  after: { hour: number; minute: number } | undefined
): boolean {
  if (!after || !arrivalIso) return false;
  const d = new Date(arrivalIso);
  if (isNaN(d.getTime())) return false;
  const arr = d.getHours() * 60 + d.getMinutes();
  const threshold = after.hour * 60 + after.minute;
  return arr > threshold;
}

/** Month cell bar: green = productive time vs this daily goal (7h), capped at 100%. */
const DAILY_PRODUCTIVE_GOAL_MS = 7 * 60 * 60 * 1000;

type CellModel =
  | { kind: "out-of-month"; dateKey: string; dayNum: number }
  | { kind: "future"; dateKey: string; dayNum: number }
  | { kind: "working"; dateKey: string; dayNum: number }
  | { kind: "absent"; dateKey: string; dayNum: number }
  | {
      kind: "completed";
      dateKey: string;
      dayNum: number;
      stats: MonthOverviewDay;
    }
  | { kind: "empty"; dateKey: string; dayNum: number };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function parseYmd(dateKey: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateKey.split("-").map(Number);
  return { y, m, d };
}

function ymdLocal(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/** Monday = 0 … Sunday = 6 */
function weekdayMon0(y: number, m: number, d: number): number {
  const wd = new Date(y, m - 1, d).getDay();
  return wd === 0 ? 6 : wd - 1;
}

function buildCalendarGrid(
  monthStartYmd: string,
  monthEndYmd: string,
  todayYmd: string,
  dayByKey: Map<string, MonthOverviewDay>
): CellModel[] {
  const { y: y0, m: m0, d: d0 } = parseYmd(monthStartYmd);
  const { y: y1, m: m1, d: d1 } = parseYmd(monthEndYmd);

  const first = new Date(y0, m0 - 1, d0);
  const lead = weekdayMon0(y0, m0, d0);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - lead);

  const last = new Date(y1, m1 - 1, d1);
  const lastWd = last.getDay();
  const tail = lastWd === 0 ? 0 : 7 - lastWd;
  const gridEnd = new Date(last);
  gridEnd.setDate(last.getDate() + tail);

  const cells: CellModel[] = [];
  for (
    let cur = new Date(gridStart);
    cur <= gridEnd;
    cur.setDate(cur.getDate() + 1)
  ) {
    const y = cur.getFullYear();
    const m = cur.getMonth() + 1;
    const d = cur.getDate();
    const dateKey = ymdLocal(y, m, d);
    const dayNum = d;

    const inMonth =
      dateKey >= monthStartYmd && dateKey <= monthEndYmd;

    if (!inMonth) {
      cells.push({ kind: "out-of-month", dateKey, dayNum });
      continue;
    }

    if (dateKey > todayYmd) {
      cells.push({ kind: "future", dateKey, dayNum });
      continue;
    }

    const stats = dayByKey.get(dateKey);
    if (!stats) {
      cells.push({ kind: "empty", dateKey, dayNum });
      continue;
    }

    const hasWork =
      stats.deskTimeMs > 0 ||
      stats.productiveTimeMs > 0 ||
      !!stats.arrivalTime;

    if (dateKey === todayYmd) {
      if (stats.isOnline) {
        cells.push({ kind: "working", dateKey, dayNum });
        continue;
      }
      if (hasWork) {
        cells.push({ kind: "completed", dateKey, dayNum, stats });
        continue;
      }
      cells.push({ kind: "empty", dateKey, dayNum });
      continue;
    }

    if (hasWork) {
      cells.push({ kind: "completed", dateKey, dayNum, stats });
      continue;
    }

    const sat = weekdayMon0(y, m, d) === 5;
    const sun = weekdayMon0(y, m, d) === 6;
    if (sat || sun) {
      cells.push({ kind: "empty", dateKey, dayNum });
      continue;
    }

    cells.push({ kind: "absent", dateKey, dayNum });
  }

  return cells;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthlyProductivityCalendar(props: {
  monthStartYmd: string;
  monthEndYmd: string;
  days: MonthOverviewDay[];
  todayYmd: string;
  isLoading?: boolean;
  error?: string | null;
  /** If set, arrival time is shown in red when strictly after this local time (DeskTime-style late). */
  lateArrivalAfterLocal?: { hour: number; minute: number };
}) {
  const {
    monthStartYmd,
    monthEndYmd,
    days,
    todayYmd,
    isLoading,
    error,
    lateArrivalAfterLocal,
  } = props;

  const dayByKey = useMemo(() => {
    const m = new Map<string, MonthOverviewDay>();
    for (const row of days) m.set(row.date, row);
    return m;
  }, [days]);

  const grid = useMemo(
    () => buildCalendarGrid(monthStartYmd, monthEndYmd, todayYmd, dayByKey),
    [monthStartYmd, monthEndYmd, todayYmd, dayByKey]
  );

  const rows = useMemo(() => {
    const r: CellModel[][] = [];
    for (let i = 0; i < grid.length; i += 7) {
      r.push(grid.slice(i, i + 7));
    }
    return r;
  }, [grid]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
        Month overview
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Daily arrival, time at work, productive time, and active time for each
        day. The green bar fills toward a 7h productive-time goal per day (full
        bar at 7h or more).
      </p>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-500">
          Loading calendar…
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div
              className="grid gap-0 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden"
              style={{
                gridTemplateColumns: "repeat(7, minmax(7rem, 1fr))",
              }}
            >
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-1 py-2 text-center border-b border-slate-200 dark:border-slate-600"
                >
                  {w}
                </div>
              ))}

              {rows.flatMap((week) =>
                week.map((cell) => (
                  <CalendarCell
                    key={cell.dateKey}
                    cell={cell}
                    lateArrivalAfterLocal={lateArrivalAfterLocal}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarCell({
  cell,
  lateArrivalAfterLocal,
}: {
  cell: CellModel;
  lateArrivalAfterLocal?: { hour: number; minute: number };
}) {
  const base =
    "relative min-h-[132px] border-b border-r border-slate-200 dark:border-slate-600 px-1.5 py-1 text-[10px] leading-snug";

  if (cell.kind === "out-of-month") {
    return (
      <div className={`${base} bg-slate-100 dark:bg-slate-800/60`}>
        <span className="absolute top-1 right-1.5 text-slate-400 dark:text-slate-500">
          {cell.dayNum}
        </span>
      </div>
    );
  }

  if (cell.kind === "future" || cell.kind === "empty") {
    return (
      <div className={`${base} bg-white dark:bg-slate-900/20`}>
        <span className="absolute top-1 right-1.5 text-slate-500 dark:text-slate-400">
          {cell.dayNum}
        </span>
      </div>
    );
  }

  if (cell.kind === "working") {
    return (
      <div
        className={`${base} bg-emerald-50 dark:bg-emerald-950/30 border-l-[3px] border-l-emerald-600`}
      >
        <span className="absolute top-1 right-1.5 text-slate-600 dark:text-slate-300 font-medium">
          {cell.dayNum}
        </span>
        <div className="pt-4 text-emerald-700 dark:text-emerald-400 font-medium text-center">
          Working
        </div>
      </div>
    );
  }

  if (cell.kind === "absent") {
    return (
      <div
        className={`${base} bg-rose-50 dark:bg-rose-950/25 border-l-[3px] border-l-rose-500`}
      >
        <span className="absolute top-1 right-1.5 text-slate-600 dark:text-slate-300 font-medium">
          {cell.dayNum}
        </span>
        <div className="pt-4 text-rose-700 dark:text-rose-300 font-medium text-center">
          Absent
        </div>
      </div>
    );
  }

  const { stats } = cell;
  const prodPct = Math.min(
    100,
    (stats.productiveTimeMs / DAILY_PRODUCTIVE_GOAL_MS) * 100,
  );
  const grayPct = Math.max(0, 100 - prodPct);

  const arrivedAt = formatTime24Local(stats.arrivalTime);
  const leftAt =
    stats.isOnline || !stats.leftTime
      ? "—"
      : formatTime24Local(stats.leftTime);
  const arrivalLate = isArrivalLate(stats.arrivalTime, lateArrivalAfterLocal);

  const line =
    "block w-full text-center whitespace-nowrap text-slate-700 dark:text-slate-300";

  return (
    <div className={`${base} bg-white dark:bg-slate-900/20`}>
      <span className="absolute top-1.5 right-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
        {cell.dayNum}
      </span>

      <div className="flex flex-col items-center pt-5">
        <div className="mb-2.5 w-[92%] max-w-[10rem]">
          <div className="flex h-[5px] w-full overflow-hidden rounded-sm bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${prodPct}%` }}
            />
            {grayPct > 0 ? (
              <div
                className="h-full bg-slate-400/70 dark:bg-slate-500/55"
                style={{ width: `${grayPct}%` }}
              />
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-col gap-[2px] text-[10px]">
          <div className={line}>
            <span className="text-slate-600 dark:text-slate-400">
              Arrived at:{" "}
            </span>
            <span
              className={
                arrivalLate
                  ? "font-medium text-red-600 dark:text-red-400"
                  : "font-medium text-slate-900 dark:text-slate-100"
              }
            >
              {arrivedAt}
            </span>
          </div>
          <div className={line}>
            <span className="text-slate-600 dark:text-slate-400">
              Left at:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {leftAt}
            </span>
          </div>
          <div className={line}>
            <span className="text-slate-600 dark:text-slate-400">
              Worked for:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatDuration(stats.timeAtWorkMs)}
            </span>
          </div>
          <div className={line}>
            <span className="text-slate-600 dark:text-slate-400">
              Productive time:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatDuration(stats.productiveTimeMs)}
            </span>
          </div>
          <div className={line}>
            <span className="text-slate-600 dark:text-slate-400">
              Desk time:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatDuration(stats.deskTimeMs)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
