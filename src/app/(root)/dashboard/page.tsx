"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { useAppSelector } from "@/redux/hooks";
import { StatCard } from "@/components/ui/StatCard/StatCard";

// Mock data for dashboard stats
const dashboardStats = [
  {
    label: "Total Time Tracked",
    value: "124.5h",
    subtitle: "THIS WEEK",
    progress: 75,
    progressColor: "teal" as const,
  },
  {
    label: "Active Sessions",
    value: "12",
    subtitle: "TODAY",
    // No progress - will show value prominently
  },
  {
    label: "Projects",
    value: "8",
    subtitle: "ACTIVE",
    // No progress - will show value prominently
  },
  {
    label: "Today's Hours",
    value: "6.5h",
    subtitle: "PER DAY",
    progress: 65,
    progressColor: "navy" as const,
  },
  {
    label: "Weekly Average",
    value: "8.2h",
    subtitle: "PER DAY",
    progress: 82,
    progressColor: "teal" as const,
  },
  {
    label: "Productivity Score",
    value: "87%",
    subtitle: "THIS WEEK",
    progress: 87,
    progressColor: "coral" as const,
  },
  {
    label: "Idle Time",
    value: "1.2h",
    subtitle: "TODAY",
    // No progress - will show value prominently
  },
  {
    label: "Focus Time",
    value: "4.8h",
    subtitle: "TODAY",
    progress: 80,
    progressColor: "navy" as const,
  },
];

const OrgDashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome{" "}
            <span className="font-semibold">
              {user?.name || user?.email || "user"}
            </span>
            . Here's your time tracking overview.
          </p>
        </div>

        {/* Stat Cards Grid - 8 cards in 2 rows (4 per row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {dashboardStats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              subtitle={stat.subtitle}
              progress={stat.progress}
              progressColor={stat.progressColor}
            />
          ))}
        </div>
      </div>
    </AuthGuard>
  );
};

export default OrgDashboardPage;

