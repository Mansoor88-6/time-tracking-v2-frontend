"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAppSelector } from "@/redux/hooks";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { AppUsageSection, AppUsageItem } from "@/components/ui/AppUsageSection";
import type { TimeSlotData } from "@/components/ui/ProductivityTimeline";
import {
  fetchDashboardStats,
  fetchOrganizationDashboardStats,
  formatDuration,
  formatTimeWithSuffix,
  type DashboardStatsResponse,
  type OrganizationDashboardStatsResponse,
} from "@/services/dashboardStats";
import { usersApi, User } from "@/lib/api/users";
import { teamsApi, Team } from "@/lib/api/teams";
// Using string literals for role comparison since UserRole has a naming conflict
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { BiFilter, BiX, BiCalendar, BiUser, BiGroup, BiChevronDown } from "react-icons/bi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/DropdownMenu/DropdownMenu";
import {
  useAppUsageStats,
  formatCategoryTotal,
  type AppUsageStatsResponse,
} from "@/services/appUsage";
import { getAppIcon } from "@/utils/appIcons";

type DashboardStat = {
  label: string;
  value: string | number;
  subtitle?: string;
  valueSuffix?: string;
  helperText?: string;
  progress?: number;
  progressColor?: "teal" | "coral" | "yellow" | "navy" | "pink";
};

/**
 * Convert dashboard stats response to stat card format
 */
function mapStatsToCards(stats: DashboardStatsResponse | null): DashboardStat[] {
  if (!stats) {
    // Return empty/default stats while loading
    return [
      {
        label: "Arrival Time",
        value: "--:--",
        subtitle: "TODAY",
      },
      {
        label: "Left Time",
        value: "--:--",
        subtitle: "TODAY",
      },
      {
        label: "Productive Time",
        value: "0m",
        subtitle: "TODAY",
      },
      {
        label: "Desktime Time",
        value: "0m",
        subtitle: "TODAY",
      },
      {
        label: "Time at work",
        value: "0m",
        subtitle: "TODAY",
      },
      {
        label: "Productivity Score",
        value: "0%",
        subtitle: "THIS WEEK",
        progress: 0,
        progressColor: "pink" as const,
      },
      {
        label: "Effectiveness",
        value: "0%",
        subtitle: "THIS WEEK",
        progress: 0,
        progressColor: "pink" as const,
      },
      {
        label: "Projects Time",
        value: "0m",
        subtitle: "TODAY",
      },
    ];
  }

  // Format arrival time
  const arrivalTimeFormatted = formatTimeWithSuffix(stats.arrivalTime);
  
  // Format left time (null if online)
  const leftTimeFormatted = stats.isOnline
    ? null
    : formatTimeWithSuffix(stats.leftTime);

  return [
    {
      label: "Arrival Time",
      value: arrivalTimeFormatted?.time ?? "--:--",
      valueSuffix: arrivalTimeFormatted?.suffix,
      subtitle: "TODAY",
    },
    {
      label: "Left Time",
      value: leftTimeFormatted?.time ?? "--:--",
      valueSuffix: leftTimeFormatted?.suffix,
      subtitle: "TODAY",
      helperText: stats.isOnline ? "Online" : undefined,
    },
    {
      label: "Productive Time",
      value: formatDuration(stats.productiveTimeMs),
      subtitle: "TODAY",
    },
    {
      label: "Desktime Time",
      value: formatDuration(stats.deskTimeMs),
      subtitle: "TODAY",
    },
    {
      label: "Time at work",
      value: formatDuration(stats.timeAtWorkMs),
      subtitle: "TODAY",
    },
    {
      label: "Productivity Score",
      value: `${stats.productivityScorePct}%`,
      subtitle: "THIS WEEK",
      progress: stats.productivityScorePct,
      progressColor: "pink" as const,
    },
    {
      label: "Effectiveness",
      value: `${stats.effectivenessPct}%`,
      subtitle: "THIS WEEK",
      progress: stats.effectivenessPct,
      progressColor: "pink" as const,
    },
    {
      label: "Projects Time",
      value: formatDuration(stats.projectsTimeMs),
      subtitle: "TODAY",
    },
  ];
}

/**
 * Transform app usage API response to AppUsageItem format
 */
function transformAppUsage(appUsage: AppUsageStatsResponse | undefined): {
  productive: AppUsageItem[];
  unproductive: AppUsageItem[];
  neutral: AppUsageItem[];
  totals: {
    productive: string;
    unproductive: string;
    neutral: string;
  };
} {
  if (!appUsage) {
    return {
      productive: [],
      unproductive: [],
      neutral: [],
      totals: {
        productive: "0m",
        unproductive: "0m",
        neutral: "0m",
      },
    };
  }

  const transformApps = (apps: typeof appUsage.productive): AppUsageItem[] => {
    return apps.map((app, index) => ({
      id: `${app.category}-${index}-${app.appName}`,
      name: app.appName,
      icon: getAppIcon(app.appName, app.appType),
      timeSpent: formatDuration(app.productiveTimeMs),
      urlBreakdown: app.urlBreakdown || [], // Include URL breakdown for tooltip
    }));
  };

  return {
    productive: transformApps(appUsage.productive),
    unproductive: transformApps(appUsage.unproductive),
    neutral: transformApps(appUsage.neutral),
    totals: {
      productive: formatCategoryTotal(appUsage.totals.productive),
      unproductive: formatCategoryTotal(appUsage.totals.unproductive),
      neutral: formatCategoryTotal(appUsage.totals.neutral),
    },
  };
}

// Generate mock timeline data (24 hours, 5-minute intervals)
// This simulates a typical workday with activity from 9 AM to 7 PM
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateMockTimelineData = (): TimeSlotData[] => {
  const data: TimeSlotData[] = [];
  
  // Generate all 5-minute slots
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      
      // Simulate activity during work hours (9 AM - 7 PM)
      const isWorkHours = hour >= 9 && hour < 19;
      
      if (isWorkHours) {
        // Simulate varying activity levels
        const baseActivity = 60 + Math.random() * 40; // 60-100% activity
        const productive = Math.floor(baseActivity * 0.7); // 70% productive
        const unproductive = Math.floor(baseActivity * 0.15); // 15% unproductive
        const neutral = Math.floor(baseActivity * 0.15); // 15% neutral
        
        // Ensure percentages don't exceed 100
        const total = productive + unproductive + neutral;
        const scale = Math.min(100 / total, 1);
        
        data.push({
          time,
          productive: Math.floor(productive * scale),
          unproductive: Math.floor(unproductive * scale),
          neutral: Math.floor(neutral * scale),
          totalActivity: Math.min(100, Math.floor(total * scale)),
          isTracked: true,
        });
      } else {
        // No tracked time outside work hours
        data.push({
          time,
          productive: 0,
          unproductive: 0,
          neutral: 0,
          totalActivity: 0,
          isTracked: false,
        });
      }
    }
  }
  
  return data;
};

const OrgDashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isOrgAdmin = user?.role === "ORG_ADMIN" || user?.role === "SUPER_ADMIN";
  
  // Individual dashboard state
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Organization dashboard state
  const [orgStats, setOrgStats] = useState<OrganizationDashboardStatsResponse | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [errorOrg, setErrorOrg] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  
  // Filters for organization dashboard
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterUserIds, setFilterUserIds] = useState<number[]>([]);
  const [filterTeamIds, setFilterTeamIds] = useState<number[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
  const [teamsDropdownOpen, setTeamsDropdownOpen] = useState(false);

  // Get user's timezone (default to browser timezone)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Fetch app usage stats
  const {
    data: appUsageData,
    isLoading: isAppUsageLoading,
    isError: isAppUsageError,
    error: appUsageError,
  } = useAppUsageStats(dateStr, timezone);

  // Load users and teams for filters (ORG_ADMIN only)
  useEffect(() => {
    if (isOrgAdmin) {
      const loadData = async () => {
        try {
          const [usersData, teamsData] = await Promise.all([
            usersApi.list(),
            teamsApi.list(),
          ]);
          setAllUsers(usersData);
          setAllTeams(teamsData);
        } catch (err) {
          console.error("Failed to load users/teams:", err);
        }
      };
      void loadData();
    }
  }, [isOrgAdmin]);

  // Fetch individual dashboard stats on mount
  useEffect(() => {
    if (!isOrgAdmin) {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await fetchDashboardStats(dateStr, timezone);
        setStats(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard stats";
        setError(errorMessage);
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
    }
  }, [dateStr, timezone, isOrgAdmin]);

  // Fetch organization dashboard stats
  useEffect(() => {
    if (!isOrgAdmin) return;

    const loadOrgStats = async () => {
      try {
        setIsLoadingOrg(true);
        setErrorOrg(null);
        
        const data = await fetchOrganizationDashboardStats({
          date: filterDate || undefined,
          startDate: filterStartDate || undefined,
          endDate: filterEndDate || undefined,
          timezone,
          userIds: filterUserIds.length > 0 ? filterUserIds : undefined,
          teamIds: filterTeamIds.length > 0 ? filterTeamIds : undefined,
        });
        setOrgStats(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load organization stats";
        setErrorOrg(errorMessage);
        console.error("Failed to fetch organization stats:", err);
      } finally {
        setIsLoadingOrg(false);
      }
    };

    void loadOrgStats();
  }, [isOrgAdmin, filterDate, filterStartDate, filterEndDate, filterUserIds, filterTeamIds, timezone]);

  const dashboardStats = mapStatsToCards(stats);
  const appUsage = transformAppUsage(appUsageData);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddOfflineTime = (
    time: string,
    category: "productive" | "unproductive" | "neutral",
    duration: number
  ) => {
    // This would typically call an API to save offline time
    console.log(`Adding ${duration} minutes of ${category} time at ${time}`);
    // In a real implementation, you would update the timeline data here
  };

  // Organization Dashboard View
  if (isOrgAdmin) {
    const aggregatedStats = orgStats?.aggregated;
    const userStats = orgStats?.users || [];

    const orgDashboardStats: DashboardStat[] = aggregatedStats
      ? [
          {
            label: "Total Productive Time",
            value: formatDuration(aggregatedStats.totalProductiveTimeMs),
            subtitle: filterStartDate && filterEndDate ? "DATE RANGE" : "TODAY",
          },
          {
            label: "Average Productivity Score",
            value: `${Math.round(aggregatedStats.averageProductivityScore)}%`,
            subtitle: filterStartDate && filterEndDate ? "DATE RANGE" : "TODAY",
            progress: Math.round(aggregatedStats.averageProductivityScore),
            progressColor: "pink" as const,
          },
          {
            label: "Total Active Users",
            value: aggregatedStats.activeUsers,
            subtitle: `of ${aggregatedStats.totalUsers} users`,
          },
          {
            label: "Total Desk Time",
            value: formatDuration(aggregatedStats.totalDeskTimeMs),
            subtitle: filterStartDate && filterEndDate ? "DATE RANGE" : "TODAY",
          },
          {
            label: "Average Effectiveness",
            value: `${Math.round(aggregatedStats.averageEffectiveness)}%`,
            subtitle: filterStartDate && filterEndDate ? "DATE RANGE" : "TODAY",
            progress: Math.round(aggregatedStats.averageEffectiveness),
            progressColor: "pink" as const,
          },
          {
            label: "Total Projects Time",
            value: formatDuration(aggregatedStats.totalProjectsTimeMs),
            subtitle: filterStartDate && filterEndDate ? "DATE RANGE" : "TODAY",
          },
        ]
      : [];

    const userStatsColumns: AdminTableColumn<typeof userStats[0]>[] = [
      {
        key: "userName",
        label: "User",
        sortable: true,
        render: (row) => (
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {row.userName}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {row.userEmail}
            </div>
          </div>
        ),
      },
      {
        key: "productiveTime",
        label: "Productive Time",
        sortable: true,
        render: (row) => formatDuration(row.stats.productiveTimeMs),
      },
      {
        key: "deskTime",
        label: "Desk Time",
        sortable: true,
        render: (row) => formatDuration(row.stats.deskTimeMs),
      },
      {
        key: "productivityScore",
        label: "Productivity Score",
        sortable: true,
        render: (row) => `${row.stats.productivityScorePct}%`,
      },
      {
        key: "effectiveness",
        label: "Effectiveness",
        sortable: true,
        render: (row) => `${row.stats.effectivenessPct}%`,
      },
    ];

    // Count active filters
    const activeFilterCount =
      (filterDate ? 1 : 0) +
      (filterStartDate && filterEndDate ? 1 : 0) +
      filterUserIds.length +
      filterTeamIds.length;

    const hasActiveFilters = activeFilterCount > 0;

    // Get selected user/team names for display
    const selectedUserNames = allUsers
      .filter((u) => filterUserIds.includes(u.id))
      .map((u) => u.name || u.email);
    const selectedTeamNames = allTeams
      .filter((t) => filterTeamIds.includes(t.id))
      .map((t) => t.name);

    const clearAllFilters = () => {
      setFilterDate("");
      setFilterStartDate("");
      setFilterEndDate("");
      setFilterUserIds([]);
      setFilterTeamIds([]);
    };

    return (
      <AuthGuard>
        <div className="space-y-6">
          {/* Header with integrated filters */}
          <div className="space-y-4">
            {/* <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Organization Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View time tracking analytics across all users in your organization.
                </p>
              </div>
            </div> */}

            {/* Compact Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-end gap-3">
              {/* Date Filter - Single Date */}
              <div className="relative">
                <BiCalendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setFilterStartDate("");
                    setFilterEndDate("");
                  }}
                  className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Date"
                />
              </div>

              {/* Date Range - Start Date */}
              <div className="relative">
                <BiCalendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => {
                    setFilterStartDate(e.target.value);
                    setFilterDate("");
                  }}
                  className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Start Date"
                />
              </div>

              {/* Date Range - End Date */}
              {filterStartDate && (
                <div className="relative">
                  <BiCalendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => {
                      setFilterEndDate(e.target.value);
                      setFilterDate("");
                    }}
                    className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="End Date"
                  />
                </div>
              )}

              {/* Users Filter Dropdown */}
              <DropdownMenu open={usersDropdownOpen} onOpenChange={setUsersDropdownOpen}>
                <DropdownMenuTrigger className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-w-[140px] justify-between">
                  <div className="flex items-center gap-2">
                    <BiUser className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">
                      {selectedUserNames.length === 0
                        ? "Users"
                        : selectedUserNames.length === 1
                        ? selectedUserNames[0]
                        : `${selectedUserNames.length} user(s)`}
                    </span>
                  </div>
                  <BiChevronDown className="w-4 h-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto w-[240px]">
                  {allUsers.map((user) => (
                    <DropdownMenuCheckboxItem
                      key={user.id}
                      checked={filterUserIds.includes(user.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterUserIds([...filterUserIds, user.id]);
                        } else {
                          setFilterUserIds(filterUserIds.filter((id) => id !== user.id));
                        }
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name || user.email}</span>
                        {user.name && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Teams Filter Dropdown */}
              <DropdownMenu open={teamsDropdownOpen} onOpenChange={setTeamsDropdownOpen}>
                <DropdownMenuTrigger className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-w-[140px] justify-between">
                  <div className="flex items-center gap-2">
                    <BiGroup className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">
                      {selectedTeamNames.length === 0
                        ? "Teams"
                        : selectedTeamNames.length === 1
                        ? selectedTeamNames[0]
                        : `${selectedTeamNames.length} team(s)`}
                    </span>
                  </div>
                  <BiChevronDown className="w-4 h-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto w-[240px]">
                  {allTeams.map((team) => (
                    <DropdownMenuCheckboxItem
                      key={team.id}
                      checked={filterTeamIds.includes(team.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterTeamIds([...filterTeamIds, team.id]);
                        } else {
                          setFilterTeamIds(filterTeamIds.filter((id) => id !== team.id));
                        }
                      }}
                    >
                      <span className="text-sm">{team.name}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  showAdvancedFilters
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                <BiFilter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 dark:bg-slate-800/30 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  <BiX className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {filterDate && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                    Date: {new Date(filterDate).toLocaleDateString()}
                    <button
                      onClick={() => setFilterDate("")}
                      className="hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-full p-0.5"
                    >
                      <BiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterStartDate && filterEndDate && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                    Range: {new Date(filterStartDate).toLocaleDateString()} - {new Date(filterEndDate).toLocaleDateString()}
                    <button
                      onClick={() => {
                        setFilterStartDate("");
                        setFilterEndDate("");
                      }}
                      className="hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-full p-0.5"
                    >
                      <BiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedUserNames.map((name, idx) => {
                  const userId = filterUserIds[idx];
                  return (
                    <span
                      key={userId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full"
                    >
                      User: {name}
                      <button
                        onClick={() => setFilterUserIds(filterUserIds.filter((id) => id !== userId))}
                        className="hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-full p-0.5"
                      >
                        <BiX className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                {selectedTeamNames.map((name, idx) => {
                  const teamId = filterTeamIds[idx];
                  return (
                    <span
                      key={teamId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full"
                    >
                      Team: {name}
                      <button
                        onClick={() => setFilterTeamIds(filterTeamIds.filter((id) => id !== teamId))}
                        className="hover:bg-green-200 dark:hover:bg-green-900/50 rounded-full p-0.5"
                      >
                        <BiX className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Advanced Filters Panel (Collapsible) - Only for date range selection */}
            {showAdvancedFilters && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Use the dropdowns above to select users and teams. Date filters are available in the toolbar.
                </p>
              </div>
            )}
          </div>

          {/* Aggregated Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {isLoadingOrg ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center p-6 rounded-2xl bg-stat stat-card-hover card-shadow-lg animate-pulse"
                >
                  <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))
            ) : errorOrg ? (
              <div className="col-span-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">
                  Error loading organization stats: {errorOrg}
                </p>
              </div>
            ) : (
              orgDashboardStats.map((stat, index) => (
                <StatCard
                  key={index}
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

          {/* Per-User Breakdown Table */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                User Breakdown
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Individual time tracking statistics for each user
              </p>
            </div>
            <AdminDataTable
              data={userStats.map((stat) => ({ ...stat, id: stat.userId }))}
              columns={userStatsColumns}
              loading={isLoadingOrg}
              emptyMessage="No user data available for the selected filters."
            />
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Individual Dashboard View
  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome{" "}
            <span className="font-semibold">
              {user?.name || user?.email || "user"}
            </span>
            . Here&apos;s your time tracking overview.
          </p>
        </div> */}

        {/* Stat Cards Grid - 8 cards in 2 rows (4 per row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            // Show loading state
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center p-6 rounded-2xl bg-stat stat-card-hover card-shadow-lg animate-pulse"
              >
                <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))
          ) : error ? (
            // Show error state
            <div className="col-span-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">
                Error loading dashboard stats: {error}
              </p>
            </div>
          ) : (
            dashboardStats.map((stat, index) => (
              <StatCard
                key={index}
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

        {/* Productivity Timeline */}
        {/* <ProductivityTimeline
          data={timelineData}
          onAddOfflineTime={handleAddOfflineTime}
        /> */}

        {/* App Usage Sections */}
        <div className="space-y-4">
          {isAppUsageLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div
                        key={j}
                        className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : isAppUsageError ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">
                Error loading app usage: {appUsageError instanceof Error ? appUsageError.message : "Unknown error"}
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
      </div>
    </AuthGuard>
  );
};

export default OrgDashboardPage;

