"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ModalForm } from "@/components/admin/ModalForm";
import { usersApi, User } from "@/lib/api/users";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { BiTrash, BiKey } from "react-icons/bi";
import { toast } from "react-toastify";
import { UserRole } from "@/types/auth/auth";

interface PasswordFormData {
  password: string;
  confirmPassword: string;
}

const UsersPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.list();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ORG_ADMIN":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "TEAM_MANAGER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "EMPLOYEE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "VIEWER":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300";
    }
  };

  const openDeleteDialog = (target: User) => {
    if (target.id === user?.id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    setSelectedUser(target);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsDeleting(true);
      await usersApi.delete(selectedUser.id);
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete user"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const openPasswordModal = (target: User) => {
    if (target.id === user?.id) {
      toast.error("Use your own profile flow to change your password.");
      return;
    }
    setSelectedUser(target);
    reset();
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    if (!selectedUser) return;
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await usersApi.update(selectedUser.id, { password: data.password });
      toast.success("Password updated successfully");
      setIsPasswordModalOpen(false);
      setSelectedUser(null);
      reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update password"
      );
    }
  };

  const columns: AdminTableColumn<User>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (row) => row.name || row.displayName || "—",
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(row.role)}`}
        >
          {row.role}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.isActive !== false
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {row.isActive !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      sortable: true,
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString()
          : "—",
    },
  ];

  return (
    <AuthGuard requiredRoles={[UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]}>
      <div className="space-y-4">
        <PageHeader
          title="Users"
          description="Manage users in your organization. View roles, status, and activity."
        />

        <DataToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by name or email..."
          filters={
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Roles</option>
              <option value="ORG_ADMIN">Organization Admin</option>
              <option value="TEAM_MANAGER">Team Manager</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="VIEWER">Viewer</option>
            </select>
          }
        />

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <AdminDataTable
          data={filteredUsers}
          columns={columns}
          loading={loading}
          emptyMessage="No users found in your organization."
          rowActions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openPasswordModal(row);
                }}
                className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                title="Change password"
              >
                <BiKey className="w-4 h-4" />
              </button>
              {row.id !== user?.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(row);
                  }}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  title="Delete user"
                >
                  <BiTrash className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        />

        {/* Change Password Modal */}
        <ModalForm
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setSelectedUser(null);
            reset();
          }}
          onSubmit={handleSubmit(handlePasswordChange)}
          title={`Change Password${selectedUser ? ` for ${selectedUser.email}` : ""}`}
          description="Set a new password for this user. They will use it on their next login."
          isLoading={isSubmitting}
          size="md"
          submitVariant="primary"
          submitLabel="Update Password"
        >
          <FloatingInput
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            label="New Password"
            id="user-new-password"
            type="password"
            error={errors.password?.message}
          />
          <FloatingInput
            {...register("confirmPassword", {
              required: "Please confirm the password",
            })}
            label="Confirm Password"
            id="user-confirm-password"
            type="password"
            error={errors.confirmPassword?.message}
          />
        </ModalForm>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDelete}
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser?.email}? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </AuthGuard>
  );
};

export default UsersPage;
