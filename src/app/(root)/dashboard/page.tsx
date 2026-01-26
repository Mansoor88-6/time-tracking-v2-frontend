"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { useAppSelector } from "@/redux/hooks";

const OrgDashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <AuthGuard>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Organization Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome{" "}
          <span className="font-semibold">
            {user?.name || user?.email || "user"}
          </span>
          .
        </p>
        {user?.tenantId && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tenant ID: {user.tenantId} &mdash; Role: {user.role}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use the sidebar to navigate to Users, Teams, Projects, Sessions, and
          Devices.
        </p>
      </div>
    </AuthGuard>
  );
};

export default OrgDashboardPage;

