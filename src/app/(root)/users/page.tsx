"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ModalForm } from "@/components/admin/ModalForm";
import { usersApi, User } from "@/lib/api/users";
import { teamsApi, Team } from "@/lib/api/teams";
import { invitationsApi, Invitation } from "@/lib/api/invitations";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { BiTrash, BiKey, BiGroup, BiPlus } from "react-icons/bi";
import { toast } from "react-toastify";

interface PasswordFormData {
  password: string;
  confirmPassword: string;
}

interface InviteFormData {
  email: string;
  role: string;
  teamIds?: number[];
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
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);
  const [userForTeamsModal, setUserForTeamsModal] = useState<User | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [isSavingTeams, setIsSavingTeams] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteTeams, setInviteTeams] = useState<Team[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>();

  const {
    register: registerInvite,
    handleSubmit: handleSubmitInvite,
    reset: resetInvite,
    watch: watchInvite,
    setValue: setValueInvite,
    formState: { errors: errorsInvite, isSubmitting: isSubmittingInvite },
  } = useForm<InviteFormData>();
  const watchedInviteTeamIds = watchInvite("teamIds") || [];

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

  const loadInvitations = async () => {
    if (!user?.tenantId) return;
    try {
      const data = await invitationsApi.list(user.tenantId);
      setInvitations(data);
    } catch {
      setInvitations([]);
    }
  };

  useEffect(() => {
    void loadUsers();
    void loadInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, user?.tenantId]);

  const openInviteModal = async () => {
    setIsInviteModalOpen(true);
    resetInvite();
    try {
      const data = await teamsApi.list();
      setInviteTeams(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load teams");
    }
  };

  const toggleInviteTeam = (teamId: number) => {
    const current = watchedInviteTeamIds || [];
    if (current.includes(teamId)) {
      setValueInvite(
        "teamIds",
        current.filter((id: number) => id !== teamId)
      );
    } else {
      setValueInvite("teamIds", [...current, teamId]);
    }
  };

  const handleInviteSubmit = async (data: InviteFormData) => {
    if (!user?.tenantId) {
      toast.error("Missing organization context");
      return;
    }
    try {
      await invitationsApi.create(user.tenantId, {
        email: data.email,
        role: data.role,
        teamIds: data.teamIds || [],
      });
      toast.success("Invitation sent successfully");
      resetInvite();
      setIsInviteModalOpen(false);
      await loadInvitations();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send invitation"
      );
    }
  };

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

  const openTeamsModal = async (target: User) => {
    setUserForTeamsModal(target);
    setSelectedTeamIds((target.teams ?? []).map((t) => t.id));
    setIsTeamsModalOpen(true);
    try {
      const teams = await teamsApi.list();
      setAllTeams(teams);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load teams"
      );
    }
  };

  const handleTeamsSave = async () => {
    if (!userForTeamsModal) return;
    const currentIds = new Set(
      (userForTeamsModal.teams ?? []).map((t) => t.id)
    );
    const newIds = new Set(selectedTeamIds);
    const toAdd = [...newIds].filter((id) => !currentIds.has(id));
    const toRemove = [...currentIds].filter((id) => !newIds.has(id));
    try {
      setIsSavingTeams(true);
      await Promise.all([
        ...toAdd.map((teamId) =>
          teamsApi.addTeamMember(teamId, userForTeamsModal.id)
        ),
        ...toRemove.map((teamId) =>
          teamsApi.removeTeamMember(teamId, userForTeamsModal.id)
        ),
      ]);
      toast.success("Teams updated successfully");
      setIsTeamsModalOpen(false);
      setUserForTeamsModal(null);
      await loadUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update teams"
      );
    } finally {
      setIsSavingTeams(false);
    }
  };

  const toggleTeamSelection = (teamId: number) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
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
      key: "teams",
      label: "Teams",
      render: (row) => {
        const teams = row.teams ?? [];
        return teams.length > 0 ? (
          <span className="text-slate-700 dark:text-slate-300">
            {teams.map((t) => t.name).join(", ")}
          </span>
        ) : (
          "—"
        );
      },
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
    <AuthGuard
          requiredRoles={
            ["SUPER_ADMIN", "ORG_ADMIN"] as unknown as React.ComponentProps<
              typeof AuthGuard
            >["requiredRoles"]
          }
        >
      <div className="space-y-4">
        <PageHeader
          title="User Management"
          description="Manage users and invitations in your organization. Invite new users, assign teams, and manage roles."
          primaryAction={{
            label: "Invite user",
            onClick: openInviteModal,
            icon: <BiPlus className="w-4 h-4" />,
          }}
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
                  openTeamsModal(row);
                }}
                className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                title="Manage teams"
              >
                <BiGroup className="w-4 h-4" />
              </button>
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

        {/* Manage Teams Modal */}
        <ModalForm
          isOpen={isTeamsModalOpen}
          onClose={() => {
            setIsTeamsModalOpen(false);
            setUserForTeamsModal(null);
          }}
          onSubmit={(e) => {
            e.preventDefault();
            void handleTeamsSave();
          }}
          title={`Assign teams${userForTeamsModal ? ` for ${userForTeamsModal.name ?? userForTeamsModal.email}` : ""}`}
          description="Select the teams this user belongs to. Changes are saved when you click Save."
          isLoading={isSavingTeams}
          size="md"
          submitVariant="primary"
          submitLabel="Save"
        >
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allTeams.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No teams in your organization. Create teams first from the
                Teams page.
              </p>
            ) : (
              allTeams.map((team) => (
                <label
                  key={team.id}
                  className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedTeamIds.includes(team.id)}
                    onChange={() => toggleTeamSelection(team.id)}
                    className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {team.name}
                  </span>
                </label>
              ))
            )}
          </div>
        </ModalForm>

        {/* Pending Invitations */}
        {invitations.filter((i) => !i.acceptedAt).length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Pending invitations
            </h2>
            <AdminDataTable
              data={invitations.filter((i) => !i.acceptedAt)}
              columns={[
                { key: "email", label: "Email", sortable: true },
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
                  key: "teamIds",
                  label: "Teams",
                  render: (row) =>
                    row.teamIds && row.teamIds.length > 0
                      ? `${row.teamIds.length} team(s)`
                      : "—",
                },
                {
                  key: "createdAt",
                  label: "Sent",
                  sortable: true,
                  render: (row) =>
                    row.createdAt
                      ? new Date(row.createdAt).toLocaleDateString()
                      : "—",
                },
              ]}
              emptyMessage="No pending invitations."
            />
          </div>
        )}

        {/* Invite User Modal */}
        <ModalForm
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            resetInvite();
          }}
          onSubmit={handleSubmitInvite(handleInviteSubmit)}
          title="Invite user"
          description="Send an invitation by email. They will receive a link to join your organization."
          isLoading={isSubmittingInvite}
          size="md"
          submitVariant="primary"
          submitLabel="Send invitation"
        >
          <FloatingInput
            {...registerInvite("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            label="Email"
            id="invite-email"
            type="email"
            error={errorsInvite.email?.message}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              {...registerInvite("role", { required: "Role is required" })}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a role</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="TEAM_MANAGER">Team Manager</option>
              <option value="VIEWER">Viewer</option>
            </select>
            {errorsInvite.role && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errorsInvite.role.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Teams (optional)
            </label>
            {inviteTeams.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No teams available. Create teams first from the Teams page.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-700 rounded-md p-2">
                {inviteTeams.map((team) => (
                  <label
                    key={team.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={watchedInviteTeamIds.includes(team.id)}
                      onChange={() => toggleInviteTeam(team.id)}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {team.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
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
