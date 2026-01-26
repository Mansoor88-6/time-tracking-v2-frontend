"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { devicesApi, Device } from "@/lib/api/devices";
import { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { toast } from "react-toastify";

const DevicesPage = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [revoking, setRevoking] = useState(false);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await devicesApi.list();
      setDevices(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load devices"
      );
      toast.error("Failed to load devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDevices();
  }, []);

  const filteredDevices = devices.filter((device) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      device.name?.toLowerCase().includes(searchLower) ||
      device.deviceId.toLowerCase().includes(searchLower)
    );
  });

  const handleRevoke = async () => {
    if (!selectedDevice) return;
    try {
      setRevoking(true);
      await devicesApi.revoke(selectedDevice.id);
      toast.success("Device revoked successfully");
      setIsRevokeDialogOpen(false);
      setSelectedDevice(null);
      await loadDevices();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke device"
      );
    } finally {
      setRevoking(false);
    }
  };

  const openRevokeDialog = (device: Device) => {
    setSelectedDevice(device);
    setIsRevokeDialogOpen(true);
  };

  const columns: AdminTableColumn<Device>[] = [
    {
      key: "name",
      label: "Device Name",
      sortable: true,
      render: (row) => row.name || "Unnamed Device",
    },
    {
      key: "deviceId",
      label: "Device ID",
      render: (row) => (
        <span className="font-mono text-xs">
          {row.deviceId.substring(0, 8)}...
        </span>
      ),
    },
    {
      key: "isAuthorized",
      label: "Status",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.isAuthorized
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {row.isAuthorized ? "Authorized" : "Revoked"}
        </span>
      ),
    },
    {
      key: "lastSeenAt",
      label: "Last Seen",
      sortable: true,
      render: (row) =>
        row.lastSeenAt
          ? new Date(row.lastSeenAt).toLocaleDateString()
          : "Never",
    },
    {
      key: "createdAt",
      label: "Registered",
      sortable: true,
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString()
          : "—",
    },
  ];

  return (
    <AuthGuard>
      <div className="space-y-4">
        <PageHeader
          title="Devices"
          description="Manage devices associated with your account. Revoke access from devices you no longer use or recognize."
        />

        <DataToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by device name or ID..."
        />

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <AdminDataTable
          data={filteredDevices}
          columns={columns}
          loading={loading}
          emptyMessage="No devices registered yet."
          rowActions={(row) =>
            row.isAuthorized ? (
              <div className="flex items-center justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRevokeDialog(row);
                  }}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  title="Revoke device"
                >
                  <BiTrash className="w-4 h-4" />
                </button>
              </div>
            ) : undefined
          }
        />

        {/* Revoke Confirmation */}
        <ConfirmDialog
          isOpen={isRevokeDialogOpen}
          onClose={() => {
            setIsRevokeDialogOpen(false);
            setSelectedDevice(null);
          }}
          onConfirm={handleRevoke}
          title="Revoke Device"
          message={`Are you sure you want to revoke access for "${selectedDevice?.name || selectedDevice?.deviceId}"? This device will no longer be able to access your account.`}
          confirmLabel="Revoke"
          variant="warning"
          isLoading={revoking}
        />
      </div>
    </AuthGuard>
  );
};

export default DevicesPage;
