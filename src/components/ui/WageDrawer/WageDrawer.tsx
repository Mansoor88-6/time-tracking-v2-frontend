"use client";

import Drawer from "@/components/ui/Drawer/Drawer";
import {
  fetchWageSummary,
  formatWageAmount,
  type WageSummaryResponse,
  type WageCurrencyCode,
} from "@/services/wageSummary";
import { formatDuration } from "@/services/dashboardStats";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/utils/tw";

interface WageDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Inclusive calendar range (typically one month), local YYYY-MM-DD */
  startDate: string;
  endDate: string;
  timezone: string;
  /** e.g. "May 2026" for header */
  periodLabel: string;
  /** When set (admin viewing a user), passed as userId query param */
  viewAsUserId?: number;
}

export function WageDrawer({
  open,
  onClose,
  startDate,
  endDate,
  timezone,
  periodLabel,
  viewAsUserId,
}: WageDrawerProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["wage-summary", startDate, endDate, timezone, viewAsUserId ?? "me"],
    queryFn: () =>
      fetchWageSummary({
        startDate,
        endDate,
        timezone,
        ...(viewAsUserId != null ? { viewAsUserId } : {}),
      }),
    enabled: open && !!startDate && !!endDate,
    /** Always match latest productive totals (e.g. after admin approves offline time or user deletes time). */
    staleTime: 0,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });

  return (
    <Drawer
      isOpen={open}
      onClose={onClose}
      title="Compensation overview"
      description={`Estimated earnings from productive time for ${periodLabel}. Uses compensation settings on file for this account.`}
      side="right"
      size="md"
    >
      <div className="space-y-6 px-1 py-2">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
          </div>
        ) : isError ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : "Could not load wage summary."}
          </p>
        ) : (
          <WageSummaryBody data={data!} />
        )}
      </div>
    </Drawer>
  );
}

function WageSummaryBody({ data }: { data: WageSummaryResponse }) {
  if (!data.configured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="font-medium">No compensation on file</p>
        <p className="mt-2 text-amber-800/90 dark:text-amber-200/90">
          Your administrator has not set a monthly wage and working hours for your
          account yet. Once they do, this panel will show your estimated earnings
          from tracked productive time.
        </p>
      </div>
    );
  }

  const d = data;
  const currency = d.currency as WageCurrencyCode;
  const pct = Math.min(100, d.progressTowardMonthlyPct);

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/60">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Accumulated (estimated)
        </p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
          {formatWageAmount(d.accumulatedWage, currency)}
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Monthly salary reference:{" "}
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {formatWageAmount(d.monthlyWage, currency)}
          </span>
        </p>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Progress vs monthly reference</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={cn(
                "h-full rounded-full bg-emerald-500 transition-all dark:bg-emerald-400",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/40">
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Productive time</span>
          <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
            {formatDuration(d.productiveTimeMs)}
            <span className="ml-2 text-xs font-normal text-slate-500">
              ({d.productiveHours} h)
            </span>
          </span>
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Weekdays in period
          </span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {d.workdaysInPeriod}
          </span>
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Daily working hours (expected)
          </span>
          <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
            {d.dailyWorkingHours} h
          </span>
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Implied hourly rate
          </span>
          <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
            {formatWageAmount(d.hourlyRate, currency)}/h
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        <p>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Productive hours
          </span>{" "}
          are the same totals as your dashboard (tracked activity classified as
          productive, including segments added later when an admin approves
          offline time as productive). Reopen this panel or switch away and back
          to see updates.
        </p>
        <p>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Implied hourly rate
          </span>{" "}
          = monthly wage ÷ (your daily hours × weekdays Mon–Fri in{" "}
          <strong>this</strong> period). So a month with more weekdays spreads
          the same salary across more nominal hours — the rate is{" "}
          <strong>slightly lower</strong> than a shorter month (fewer weekdays →
          slightly higher rate). Accumulated pay is always{" "}
          <strong>productive hours × that rate</strong>.
        </p>
        <p>Illustration only; not payroll.</p>
      </div>
    </>
  );
}
