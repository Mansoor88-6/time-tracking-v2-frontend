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

  const isOrgAdmin = user?.role === "ORG_ADMIN";

  const loadSessions = async () => {
    try {
      setLoading(true);
      let data: Session[];
      if (isOrgAdmin) {
        try {
          data = await sessionsApi.getOrganizationSessions();
        } catch {
          // Fallback to user sessions if org endpoint fails
          data = await sessionsApi.getMySessions();
        }
      } else {
        data = await sessionsApi.getMySessions();
      }
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
    {
      key: "deviceName",
      label: "Device",
      sortable: true,
      render: (row) =>
        row.deviceName || row.deviceId || "Unknown Device",
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
            isOrgAdmin
              ? "View and manage active sessions across your organization. Revoke suspicious or unwanted sessions."
              : "View your active sessions. You can revoke sessions from devices you no longer use."
          }
        />

        <DataToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by device, IP, or user agent..."
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
          emptyMessage="No active sessions found."
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
