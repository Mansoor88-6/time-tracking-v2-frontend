"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";

interface Tenant {
  id: number;
  name: string;
  email?: string;
  status?: string;
}

const SuperAdminDashboardPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await apiClient<Tenant[]>("/tenants");
      setTenants(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTenants();
  }, []);

  const updateTenantStatus = async (id: number, action: "approve" | "suspend" | "activate") => {
    try {
      await apiClient(`/tenants/${id}/${action}`, {
        method: "POST",
      });
      await loadTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tenant");
    }
  };

  return (
    <AuthGuard requireSuperAdmin>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage organizations (tenants) on the platform.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 text-red-800 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading tenants...</p>
        ) : tenants.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">No tenants found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900/40">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-200">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-200">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-200">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-200">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="border-t border-slate-200 dark:border-slate-800"
                  >
                    <td className="px-4 py-2">{tenant.id}</td>
                    <td className="px-4 py-2">{tenant.name}</td>
                    <td className="px-4 py-2">{tenant.email ?? "-"}</td>
                    <td className="px-4 py-2 uppercase text-xs font-semibold">
                      {tenant.status ?? "-"}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        className="text-xs px-2 py-1 rounded border text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => void updateTenantStatus(tenant.id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="text-xs px-2 py-1 rounded border text-amber-700 border-amber-200 hover:bg-amber-50"
                        onClick={() => void updateTenantStatus(tenant.id, "suspend")}
                      >
                        Suspend
                      </button>
                      <button
                        className="text-xs px-2 py-1 rounded border text-blue-700 border-blue-200 hover:bg-blue-50"
                        onClick={() => void updateTenantStatus(tenant.id, "activate")}
                      >
                        Activate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default SuperAdminDashboardPage;

