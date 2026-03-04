"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { apiClient } from "@/lib/apiClient";
import {
  getAgentInfo,
  uploadAgent,
  getExtensionInfo,
  uploadExtension,
  type AgentInfo,
  type ExtensionInfo,
} from "@/services/agent";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";

interface Tenant {
  id: number;
  name: string;
  email: string;
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const SuperAdminPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [tenantToSuspend, setTenantToSuspend] = useState<Tenant | null>(null);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentUploading, setAgentUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extensionInfo, setExtensionInfo] = useState<ExtensionInfo | null>(null);
  const [extensionLoading, setExtensionLoading] = useState(false);
  const [extensionUploading, setExtensionUploading] = useState(false);
  const [selectedExtensionFile, setSelectedExtensionFile] =
    useState<File | null>(null);

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

  const loadAgentInfo = async () => {
    setAgentLoading(true);
    const info = await getAgentInfo();
    setAgentInfo(info);
    setAgentLoading(false);
  };

  const loadExtensionInfo = async () => {
    setExtensionLoading(true);
    const info = await getExtensionInfo();
    setExtensionInfo(info);
    setExtensionLoading(false);
  };

  useEffect(() => {
    void loadTenants();
  }, []);

  useEffect(() => {
    void loadAgentInfo();
  }, []);

  useEffect(() => {
    void loadExtensionInfo();
  }, []);

  const updateTenantStatus = async (
    id: number,
    action: "approve" | "suspend" | "activate"
  ) => {
    try {
      await apiClient(`/tenants/${id}/${action}`, { method: "POST" });
      toast.success("Tenant updated");
      await loadTenants();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update tenant"
      );
    }
  };

  const openSuspendDialog = (tenant: Tenant) => {
    setTenantToSuspend(tenant);
    setSuspendDialogOpen(true);
  };

  const handleSuspendConfirm = async () => {
    if (!tenantToSuspend) return;
    await updateTenantStatus(tenantToSuspend.id, "suspend");
    setSuspendDialogOpen(false);
    setTenantToSuspend(null);
  };

  const filteredTenants = useMemo(() => {
    if (statusFilter === "all") return tenants;
    return tenants.filter((t) => t.status === statusFilter);
  }, [tenants, statusFilter]);

  const stats = useMemo(() => {
    const total = tenants.length;
    const pending = tenants.filter((t) => t.status === "pending").length;
    const active = tenants.filter((t) => t.status === "active").length;
    const suspended = tenants.filter((t) => t.status === "suspended").length;
    return { total, pending, active, suspended };
  }, [tenants]);

  const handleAgentUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an .exe file");
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith(".exe")) {
      toast.error("Only .exe files are allowed");
      return;
    }
    try {
      setAgentUploading(true);
      const info = await uploadAgent(selectedFile);
      setAgentInfo(info);
      setSelectedFile(null);
      toast.success("Tracking agent uploaded successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload agent"
      );
    } finally {
      setAgentUploading(false);
    }
  };

  const handleExtensionUpload = async () => {
    if (!selectedExtensionFile) {
      toast.error("Please select a .zip file");
      return;
    }
    if (!selectedExtensionFile.name.toLowerCase().endsWith(".zip")) {
      toast.error("Only .zip files are allowed");
      return;
    }
    try {
      setExtensionUploading(true);
      const info = await uploadExtension(selectedExtensionFile);
      setExtensionInfo(info);
      setSelectedExtensionFile(null);
      toast.success("Browser extension uploaded successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload extension"
      );
    } finally {
      setExtensionUploading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300";
    }
  };

  const columns: AdminTableColumn<Tenant>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "slug", label: "Slug", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(
            row.status
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <AuthGuard requireSuperAdmin>
      <div className="space-y-8">
        <PageHeader
          title="Tenant Management"
          description="Manage organizations (tenants) on the platform. Approve, suspend, or activate tenants."
        />

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {stats.total}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending
            </p>
            <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Suspended
            </p>
            <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
              {stats.suspended}
            </p>
          </div>
        </div>

        {/* Tenant table */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Filter:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm px-3 py-1.5"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <AdminDataTable
            data={filteredTenants}
            columns={columns}
            loading={loading}
            emptyMessage="No tenants found."
            rowActions={(tenant) => (
              <div className="flex items-center justify-end gap-2">
                {tenant.status === "pending" && (
                  <button
                    onClick={() => void updateTenantStatus(tenant.id, "approve")}
                    className="text-xs px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                  >
                    Approve
                  </button>
                )}
                {tenant.status === "active" && (
                  <button
                    onClick={() => openSuspendDialog(tenant)}
                    className="text-xs px-2 py-1 rounded border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                  >
                    Suspend
                  </button>
                )}
                {tenant.status === "suspended" && (
                  <button
                    onClick={() => void updateTenantStatus(tenant.id, "activate")}
                    className="text-xs px-2 py-1 rounded border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    Activate
                  </button>
                )}
              </div>
            )}
          />
        </div>

        <ConfirmDialog
          isOpen={suspendDialogOpen}
          onClose={() => {
            setSuspendDialogOpen(false);
            setTenantToSuspend(null);
          }}
          onConfirm={handleSuspendConfirm}
          title="Suspend tenant"
          message={
            tenantToSuspend
              ? `Are you sure you want to suspend "${tenantToSuspend.name}"? They will not be able to use the platform until activated.`
              : ""
          }
          confirmLabel="Suspend"
          variant="warning"
        />

        {/* Tracking Agent section */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Tracking Agent
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upload the Go tracking agent .exe. Users will be able to download it
            from the app.
          </p>
          {agentLoading ? (
            <p className="text-sm text-slate-500">Loading agent info...</p>
          ) : agentInfo ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Current build: <strong>{agentInfo.filename}</strong>,{" "}
              {formatBytes(agentInfo.size)}, uploaded{" "}
              {formatDate(agentInfo.uploadedAt)}.
            </p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No agent uploaded yet.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Choose file:
              </span>
              <input
                type="file"
                accept=".exe"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="text-sm text-slate-600 dark:text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border file:border-slate-300 dark:file:border-slate-600 file:bg-white dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200"
              />
            </label>
            {selectedFile && (
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedFile.name}
              </span>
            )}
            <button
              onClick={() => void handleAgentUpload()}
              disabled={!selectedFile || agentUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {agentUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {/* Browser Extension section */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Browser Extension
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upload the zipped browser extension for users to install.
          </p>
          {extensionLoading ? (
            <p className="text-sm text-slate-500">Loading extension info...</p>
          ) : extensionInfo ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Current build: <strong>{extensionInfo.filename}</strong>,{" "}
              {formatBytes(extensionInfo.size)}, uploaded{" "}
              {formatDate(extensionInfo.uploadedAt)}.
            </p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No extension uploaded yet.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Choose file:
              </span>
              <input
                type="file"
                accept=".zip"
                onChange={(e) =>
                  setSelectedExtensionFile(e.target.files?.[0] ?? null)
                }
                className="text-sm text-slate-600 dark:text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border file:border-slate-300 dark:file:border-slate-600 file:bg-white dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200"
              />
            </label>
            {selectedExtensionFile && (
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedExtensionFile.name}
              </span>
            )}
            <button
              onClick={() => void handleExtensionUpload()}
              disabled={!selectedExtensionFile || extensionUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {extensionUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default SuperAdminPage;
