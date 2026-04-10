"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { sessionsApi, Session } from "@/lib/api/sessions";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { toast } from "react-toastify";

const SessionsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [revoking, setRevoking] = useState(false);

  /** Org-wide list: tenant users’ active refresh-token sessions (not desktop “online” status). */
  const isOrgWideSessionView =
    user?.role === "ORG_ADMIN" || user?.role === "SUPER_ADMIN";

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = isOrgWideSessionView
        ? await sessionsApi.getOrganizationSessions()
        : await sessionsApi.getMySessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load sessions"
      );
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const filteredSessions = sessions.filter((session) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      session.userName?.toLowerCase().includes(searchLower) ||
      session.userEmail?.toLowerCase().includes(searchLower) ||
      session.tenantName?.toLowerCase().includes(searchLower) ||
      session.deviceName?.toLowerCase().includes(searchLower) ||
      session.deviceId?.toLowerCase().includes(searchLower) ||
      session.ipAddress?.toLowerCase().includes(searchLower) ||
      session.userAgent?.toLowerCase().includes(searchLower)
    );
  });

  const handleRevoke = async () => {
    if (!selectedSession) return;
    try {
      setRevoking(true);
      await sessionsApi.revoke(selectedSession.id);
      toast.success("Session revoked successfully");
      setIsRevokeDialogOpen(false);
      setSelectedSession(null);
      await loadSessions();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke session"
      );
    } finally {
      setRevoking(false);
    }
  };

  const openRevokeDialog = (session: Session) => {
    setSelectedSession(session);
    setIsRevokeDialogOpen(true);
  };

  const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) return "—";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const columns: AdminTableColumn<Session>[] = [
    ...(isOrgWideSessionView
      ? ([
          {
            key: "userEmail",
            label: "User",
            sortable: true,
            render: (row) => (
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {row.userName || row.userEmail || `User #${row.userId}`}
                </div>
                {row.userName && row.userEmail && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {row.userEmail}
                  </div>
                )}
              </div>
            ),
          },
          ...(user?.role === "SUPER_ADMIN"
            ? ([
                {
                  key: "tenantName",
                  label: "Organization",
                  sortable: true,
                  render: (row) => row.tenantName || "—",
                },
              ] as AdminTableColumn<Session>[])
            : []),
        ] as AdminTableColumn<Session>[])
      : []),
    {
      key: "deviceName",
      label: "Device",
      sortable: true,
      render: (row) =>
        row.deviceName || row.deviceId || "—",
    },
    {
      key: "ipAddress",
      label: "IP Address",
      sortable: true,
      render: (row) => row.ipAddress || "—",
    },
    {
      key: "userAgent",
      label: "User Agent",
      render: (row) => truncateText(row.userAgent, 50),
    },
    {
      key: "clientType",
      label: "Client Type",
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString()
          : "—",
    },
    {
      key: "lastSeenAt",
      label: "Last Seen",
      sortable: true,
      render: (row) =>
        row.lastSeenAt
          ? new Date(row.lastSeenAt).toLocaleDateString()
          : row.createdAt
            ? new Date(row.createdAt).toLocaleDateString()
            : "—",
    },
  ];

  return (
    <AuthGuard>
      <div className="space-y-4">
        <PageHeader
          title="Sessions"
          description={
            isOrgWideSessionView
              ? user?.role === "SUPER_ADMIN"
                ? "Active login sessions (refresh tokens) across all organizations. Users actively tracking time may use the desktop app without a web session listed here."
                : "Active login sessions for users in your organization (web or app sign-in). Revoke a session to sign that user out on that device."
              : "Your active login sessions. You can revoke sessions from devices you no longer use."
          }
        />

        <DataToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={
            isOrgWideSessionView
              ? "Search by user, organization, device, IP…"
              : "Search by device, IP, or user agent..."
          }
        />

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <AdminDataTable
          data={filteredSessions}
          columns={columns}
          loading={loading}
          emptyMessage={
            isOrgWideSessionView
              ? "No active login sessions for this view. Users need to sign in (web or API) to appear here; tracking-only desktop activity does not create a row."
              : "No active sessions found."
          }
          rowActions={(row) => (
            <div className="flex items-center justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openRevokeDialog(row);
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                title="Revoke session"
              >
                <BiTrash className="w-4 h-4" />
              </button>
            </div>
          )}
        />

        {/* Revoke Confirmation */}
        <ConfirmDialog
          isOpen={isRevokeDialogOpen}
          onClose={() => {
            setIsRevokeDialogOpen(false);
            setSelectedSession(null);
          }}
          onConfirm={handleRevoke}
          title="Revoke Session"
          message={`Are you sure you want to revoke this session? The user will be logged out from this device.`}
          confirmLabel="Revoke"
          variant="warning"
          isLoading={revoking}
        />
      </div>
    </AuthGuard>
  );
};

export default SessionsPage;
