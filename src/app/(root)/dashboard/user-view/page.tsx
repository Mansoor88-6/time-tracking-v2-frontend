"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { AppUsageSection } from "@/components/ui/AppUsageSection";
import {
  fetchDashboardStats,
  formatDuration,
  formatTimeWithSuffix,
  type DashboardStatsResponse,
} from "@/services/dashboardStats";
import { usersApi, User } from "@/lib/api/users";
import {
  useAppUsageStats,
  formatCategoryTotal,
  type AppUsageStatsResponse,
} from "@/services/appUsage";
import { getAppIcon } from "@/utils/appIcons";
import { PeriodSelector } from "@/components/ui/PeriodSelector/PeriodSelector";
import { DateNavigator } from "@/components/ui/DateNavigator/DateNavigator";
import { DateRangePicker } from "@/components/ui/DateRangePicker/DateRangePicker";
import {
  Period,
  getDateRangeForPeriod,
} from "@/utils/dateRange";
import { PageHeader } from "@/components/admin/PageHeader";
import { BiUser, BiChevronDown } from "react-icons/bi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu/DropdownMenu";
import type { AppUsageItem } from "@/components/ui/AppUsageSection";

type DashboardStat = {
  label: string;
  value: string | number;
  subtitle?: string;
  valueSuffix?: string;
  helperText?: string;
  progress?: number;
  progressColor?: "teal" | "coral" | "yellow" | "navy" | "pink";
};

function mapStatsToCards(
  stats: DashboardStatsResponse | null,
  period: Period = "day"
): DashboardStat[] {
  const getSubtitle = (defaultSubtitle: string) => {
    if (period === "week") return "THIS WEEK";
    if (period === "month") return "THIS MONTH";
    return defaultSubtitle;
  };

  if (!stats) {
    return [
      { label: "Arrival Time", value: "--:--", subtitle: getSubtitle("TODAY") },
      { label: "Left Time", value: "--:--", subtitle: getSubtitle("TODAY") },
      { label: "Productive Time", value: "0m", subtitle: getSubtitle("TODAY") },
      { label: "Desktime Time", value: "0m", subtitle: getSubtitle("TODAY") },
      { label: "Time at work", value: "0m", subtitle: getSubtitle("TODAY") },
      {
        label: "Productivity Score",
        value: "0%",
        subtitle: getSubtitle("THIS WEEK"),
        progress: 0,
        progressColor: "pink" as const,
      },
      {
        label: "Effectiveness",
        value: "0%",
        subtitle: getSubtitle("THIS WEEK"),
        progress: 0,
        progressColor: "pink" as const,
      },
      { label: "Projects Time", value: "0m", subtitle: getSubtitle("TODAY") },
    ];
  }

  const arrivalTimeFormatted = formatTimeWithSuffix(stats.arrivalTime);
  const leftTimeFormatted = stats.isOnline
    ? null
    : formatTimeWithSuffix(stats.leftTime);

  return [
    {
      label: "Arrival Time",
      value: arrivalTimeFormatted?.time ?? "--:--",
      valueSuffix: arrivalTimeFormatted?.suffix,
      subtitle: getSubtitle("TODAY"),
    },
    {
      label: "Left Time",
      value: leftTimeFormatted?.time ?? "--:--",
      valueSuffix: leftTimeFormatted?.suffix,
      subtitle: getSubtitle("TODAY"),
      helperText: stats.isOnline ? "Online" : undefined,
    },
    {
      label: "Productive Time",
      value: formatDuration(stats.productiveTimeMs),
      subtitle: getSubtitle("TODAY"),
    },
    {
      label: "Desktime Time",
      value: formatDuration(stats.deskTimeMs),
      subtitle: getSubtitle("TODAY"),
    },
    {
      label: "Time at work",
      value: formatDuration(stats.timeAtWorkMs),
      subtitle: getSubtitle("TODAY"),
    },
    {
      label: "Productivity Score",
      value: `${stats.productivityScorePct}%`,
      subtitle: getSubtitle("THIS WEEK"),
      progress: stats.productivityScorePct,
      progressColor: "pink" as const,
    },
    {
      label: "Effectiveness",
      value: `${stats.effectivenessPct}%`,
      subtitle: getSubtitle("THIS WEEK"),
      progress: stats.effectivenessPct,
      progressColor: "pink" as const,
    },
    {
      label: "Projects Time",
      value: formatDuration(stats.projectsTimeMs),
      subtitle: getSubtitle("TODAY"),
    },
  ];
}

function urlToDisplayLabel(url: string, maxLen = 56): string {
  if (!url?.trim()) return "";
  const withoutProtocol = url.replace(/^https?:\/\//i, "").trim();
  if (withoutProtocol.length <= maxLen) return withoutProtocol;
  return withoutProtocol.slice(0, maxLen - 3) + "...";
}

function transformAppUsage(appUsage: AppUsageStatsResponse | undefined): {
  productive: AppUsageItem[];
  unproductive: AppUsageItem[];
  neutral: AppUsageItem[];
  totals: { productive: string; unproductive: string; neutral: string };
} {
  if (!appUsage) {
    return {
      productive: [],
      unproductive: [],
      neutral: [],
      totals: { productive: "0m", unproductive: "0m", neutral: "0m" },
    };
  }
  const namesInProductive = new Set(appUsage.productive.map((a) => a.appName));
  const namesInUnproductive = new Set(appUsage.unproductive.map((a) => a.appName));
  const namesInNeutral = new Set(appUsage.neutral.map((a) => a.appName));

  const transformApps = (
    apps: typeof appUsage.productive,
    currentCategory: "productive" | "unproductive" | "neutral"
  ): AppUsageItem[] =>
    apps.map((app, index) => {
      const alsoInCategories: ("productive" | "unproductive" | "neutral")[] = [];
      if (currentCategory !== "productive" && namesInProductive.has(app.appName))
        alsoInCategories.push("productive");
      if (currentCategory !== "unproductive" && namesInUnproductive.has(app.appName))
        alsoInCategories.push("unproductive");
      if (currentCategory !== "neutral" && namesInNeutral.has(app.appName))
        alsoInCategories.push("neutral");
      const firstUrl = app.urlBreakdown?.[0]?.url;
      const displayLabel =
        alsoInCategories.length > 0 && app.appType === "web" && firstUrl
          ? urlToDisplayLabel(firstUrl)
          : undefined;
      return {
        id: `${app.category}-${index}-${app.appName}`,
        name: app.appName,
        icon: getAppIcon(app.appName, app.appType),
        timeSpent: formatDuration(app.productiveTimeMs),
        urlBreakdown: app.urlBreakdown || [],
        ...(alsoInCategories.length > 0 ? { alsoInCategories } : {}),
        ...(displayLabel ? { displayLabel } : {}),
      };
    });

  return {
    productive: transformApps(appUsage.productive, "productive"),
    unproductive: transformApps(appUsage.unproductive, "unproductive"),
    neutral: transformApps(appUsage.neutral, "neutral"),
    totals: {
      productive: formatCategoryTotal(appUsage.totals.productive),
      unproductive: formatCategoryTotal(appUsage.totals.unproductive),
      neutral: formatCategoryTotal(appUsage.totals.neutral),
    },
  };
}

const UserViewPage = () => {
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUserId, setSelectedUserIdState] = useState<number | null>(() => {
    const uid = searchParams.get("userId");
    return uid ? parseInt(uid, 10) : null;
  });
  const [period, setPeriod] = useState<Period>("day");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [customStartDate, setCustomStartDate] = useState<string | undefined>();
  const [customEndDate, setCustomEndDate] = useState<string | undefined>();
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dateRange = useMemo(() => {
    if (customStartDate && customEndDate)
      return { startDate: customStartDate, endDate: customEndDate };
    return getDateRangeForPeriod(currentDate, period);
  }, [customStartDate, customEndDate, currentDate, period]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setUsersLoading(true);
        const data = await usersApi.list();
        // Exclude organization admins from this list so tenant admins
        // don't appear in per-user stats views.
        setUsers(data.filter((u) => u.role !== "ORG_ADMIN"));
      } catch {
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const uid = searchParams.get("userId");
    if (uid) setSelectedUserIdState(parseInt(uid, 10));
  }, [searchParams]);

  const setSelectedUserId = useCallback(
    (id: number | null) => {
      setSelectedUserIdState(id);
      const url = new URL(window.location.href);
      if (id != null) url.searchParams.set("userId", String(id));
      else url.searchParams.delete("userId");
      window.history.replaceState({}, "", url.pathname + url.search);
    },
    []
  );

  useEffect(() => {
    if (selectedUserId == null) {
      setStats(null);
      setStatsError(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const data = await fetchDashboardStats(
          dateRange.date,
          timezone,
          dateRange.startDate,
          dateRange.endDate,
          selectedUserId
        );
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled)
          setStatsError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedUserId, dateRange, timezone]);

  const {
    data: appUsageData,
    isLoading: isAppUsageLoading,
    isError: isAppUsageError,
    error: appUsageError,
  } = useAppUsageStats({
    date: dateRange.date,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    timezone,
    viewAsUserId: selectedUserId ?? undefined,
  });

  const dashboardStats = mapStatsToCards(stats, period);
  const appUsage = transformAppUsage(appUsageData);

  return (
    <AuthGuard
      requiredRoles={
        ["SUPER_ADMIN", "ORG_ADMIN"] as unknown as React.ComponentProps<
          typeof AuthGuard
        >["requiredRoles"]
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="User's View"
          description="View a user's dashboard exactly as they see it. Select a user below."
        />

        {!selectedUserId ? (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              View this user's dashboard exactly as they see it. Select a user to continue.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 min-w-[220px] justify-between">
                <span className="text-sm">Select user</span>
                <BiChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto w-[280px]">
                {usersLoading ? (
                  <div className="px-3 py-4 text-sm text-slate-500">Loading users...</div>
                ) : (
                  users.map((u) => (
                    <DropdownMenuItem
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{u.name || u.email}</span>
                        {u.name && (
                          <span className="text-xs text-slate-500">{u.email}</span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm">
                  <BiUser className="w-4 h-4" />
                  <span>
                    Viewing as: {selectedUser?.name ?? selectedUser?.email ?? `User #${selectedUserId}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUserId(null)}
                  className="text-sm text-primary hover:underline"
                >
                  Change user
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <PeriodSelector
                  period={period}
                  onPeriodChange={setPeriod}
                  disabled={!!(customStartDate && customEndDate)}
                />
                <DateNavigator
                  currentDate={currentDate}
                  period={period}
                  onDateChange={setCurrentDate}
                  disabled={!!(customStartDate && customEndDate)}
                />
                <DateRangePicker
                  startDate={customStartDate}
                  endDate={customEndDate}
                  onDateRangeChange={(s, e) => {
                    setCustomStartDate(s);
                    setCustomEndDate(e);
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {statsLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center p-6 rounded-2xl bg-stat card-shadow-lg animate-pulse"
                  >
                    <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))
              ) : statsError ? (
                <div className="col-span-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400">{statsError}</p>
                </div>
              ) : (
                dashboardStats.map((stat, i) => (
                  <StatCard
                    key={i}
                    label={stat.label}
                    value={stat.value}
                    valueSuffix={stat.valueSuffix}
                    subtitle={stat.subtitle}
                    helperText={stat.helperText}
                    progress={stat.progress}
                    progressColor={stat.progressColor}
                  />
                ))
              )}
            </div>

            <div className="space-y-4">
              {isAppUsageLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
                    >
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((j) => (
                          <div
                            key={j}
                            className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : isAppUsageError ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400">
                    {appUsageError instanceof Error
                      ? appUsageError.message
                      : "Failed to load app usage"}
                  </p>
                </div>
              ) : (
                <>
                  <AppUsageSection
                    title="Productive apps"
                    totalTime={appUsage.totals.productive}
                    apps={appUsage.productive}
                    category="productive"
                    defaultExpanded={true}
                  />
                  <AppUsageSection
                    title="Unproductive apps"
                    totalTime={appUsage.totals.unproductive}
                    apps={appUsage.unproductive}
                    category="unproductive"
                    defaultExpanded={true}
                  />
                  <AppUsageSection
                    title="Neutral apps"
                    totalTime={appUsage.totals.neutral}
                    apps={appUsage.neutral}
                    category="neutral"
                    defaultExpanded={true}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
};

export default UserViewPage;
