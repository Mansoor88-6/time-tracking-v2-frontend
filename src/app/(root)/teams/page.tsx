"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ModalForm } from "@/components/admin/ModalForm";
import { teamsApi, Team, TeamMember } from "@/lib/api/teams";
import { usersApi, User } from "@/lib/api/users";
import { ruleCollectionsApi, RuleCollection } from "@/lib/api/rule-collections";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { BiPlus, BiEdit, BiTrash, BiUserPlus, BiUserMinus } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { toast } from "react-toastify";
import { UserRole } from "@/types/auth/auth";
import { useRouter } from "next/navigation";

interface TeamFormData {
  name: string;
  managerId?: string;
}

const TeamsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [teamCollections, setTeamCollections] = useState<Record<number, RuleCollection[]>>({});
  const [loadingCollections, setLoadingCollections] = useState<Record<number, boolean>>({});
  const router = useRouter();

  const canEdit = user?.role === "ORG_ADMIN" || user?.role === "TEAM_MANAGER";

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
  } = useForm<TeamFormData>();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<TeamFormData>();

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamsApi.list();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teams");
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await usersApi.list();
      setAllUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const loadTeamMembers = async (teamId: number) => {
    try {
      setLoadingMembers(true);
      const members = await teamsApi.getTeamMembers(teamId);
      setTeamMembers(members);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load team members"
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadTeamCollections = async (teamId: number) => {
    try {
      setLoadingCollections((prev) => ({ ...prev, [teamId]: true }));
      const collections = await teamsApi.getTeamCollections(teamId);
      setTeamCollections((prev) => ({ ...prev, [teamId]: collections }));
    } catch (err) {
      console.error(`Failed to load collections for team ${teamId}:`, err);
    } finally {
      setLoadingCollections((prev) => ({ ...prev, [teamId]: false }));
    }
  };

  useEffect(() => {
    // Load collections for all teams
    teams.forEach((team) => {
      void loadTeamCollections(team.id);
    });
  }, [teams]);

  useEffect(() => {
    void loadTeams();
    if (canEdit) {
      void loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (data: TeamFormData) => {
    try {
      await teamsApi.create({
        name: data.name,
        managerId: data.managerId ? parseInt(data.managerId) : undefined,
      });
      toast.success("Team created successfully");
      setIsCreateModalOpen(false);
      resetCreate();
      await loadTeams();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create team"
      );
    }
  };

  const handleEdit = async (data: TeamFormData) => {
    if (!selectedTeam) return;
    try {
      await teamsApi.update(selectedTeam.id, {
        name: data.name,
        managerId: data.managerId ? parseInt(data.managerId) : null,
      });
      toast.success("Team updated successfully");
      setIsEditModalOpen(false);
      setSelectedTeam(null);
      resetEdit();
      await loadTeams();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update team"
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedTeam) return;
    try {
      await teamsApi.delete(selectedTeam.id);
      toast.success("Team deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedTeam(null);
      await loadTeams();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete team"
      );
    }
  };

  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    resetEdit({
      name: team.name,
      managerId: team.managerId?.toString() || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteDialogOpen(true);
  };

  const openMembersModal = async (team: Team) => {
    setSelectedTeam(team);
    setIsMembersModalOpen(true);
    await loadTeamMembers(team.id);
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !selectedUserId) return;
    try {
      await teamsApi.addTeamMember(selectedTeam.id, parseInt(selectedUserId));
      toast.success("Member added successfully");
      setSelectedUserId("");
      await loadTeamMembers(selectedTeam.id);
      await loadUsers(); // Refresh to show updated list
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add member"
      );
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedTeam) return;
    try {
      await teamsApi.removeTeamMember(selectedTeam.id, userId);
      toast.success("Member removed successfully");
      await loadTeamMembers(selectedTeam.id);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove member"
      );
    }
  };

  // Get users not already in the team
  const availableUsers = allUsers.filter(
    (user) => !teamMembers.some((member) => member.userId === user.id)
  );

  const columns: AdminTableColumn<Team>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "managerName",
      label: "Manager",
      sortable: true,
      render: (row) => row.managerName || "—",
    },
    {
      key: "collections",
      label: "Collections",
      render: (row) => {
        const collections = teamCollections[row.id] || [];
        const isLoading = loadingCollections[row.id];
        
        if (isLoading) {
          return <span className="text-gray-400 text-sm">Loading...</span>;
        }
        
        if (collections.length === 0) {
          return <span className="text-gray-400 text-sm">No collections</span>;
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/productivity-rules/collections`);
                }}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs hover:bg-purple-200 transition-colors"
                title={collection.description || collection.name}
              >
                {collection.name}
              </button>
            ))}
          </div>
        );
      },
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
  ];

  return (
    <AuthGuard
      requiredRoles={[UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER]}
    >
      <div className="space-y-4">
        <PageHeader
          title="Teams"
          description="Manage teams and their members. Teams help organize projects and assign work."
          primaryAction={
            canEdit
              ? {
                  label: "New Team",
                  onClick: () => setIsCreateModalOpen(true),
                  icon: <BiPlus className="w-4 h-4" />,
                }
              : undefined
          }
        />

        <DataToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search teams..."
        />

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <AdminDataTable
          data={filteredTeams}
          columns={columns}
          loading={loading}
          emptyMessage="No teams found. Create your first team to get started."
          rowActions={
            canEdit
              ? (row) => (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMembersModal(row);
                      }}
                      className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                      title="Manage members"
                    >
                      <BiUserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(row);
                      }}
                      className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                      title="Edit team"
                    >
                      <BiEdit className="w-4 h-4" />
                    </button>
                    {user?.role === "ORG_ADMIN" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(row);
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        title="Delete team"
                      >
                        <BiTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              : undefined
          }
        />

        {/* Create Modal */}
        <ModalForm
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetCreate();
          }}
          onSubmit={handleSubmitCreate(handleCreate)}
          title="Create Team"
          description="Add a new team to your organization."
          isLoading={isSubmittingCreate}
        >
          <FloatingInput
            {...registerCreate("name", { required: "Team name is required" })}
            label="Team Name"
            id="team-name"
            type="text"
            error={errorsCreate.name?.message}
          />
          <FloatingInput
            {...registerCreate("managerId")}
            label="Manager ID (optional)"
            id="team-manager-id"
            type="number"
            error={errorsCreate.managerId?.message}
          />
        </ModalForm>

        {/* Edit Modal */}
        <ModalForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTeam(null);
            resetEdit();
          }}
          onSubmit={handleSubmitEdit(handleEdit)}
          title="Edit Team"
          description="Update team information."
          isLoading={isSubmittingEdit}
        >
          <FloatingInput
            {...registerEdit("name", { required: "Team name is required" })}
            label="Team Name"
            id="edit-team-name"
            type="text"
            error={errorsEdit.name?.message}
          />
          <FloatingInput
            {...registerEdit("managerId")}
            label="Manager ID (optional)"
            id="edit-team-manager-id"
            type="number"
            error={errorsEdit.managerId?.message}
          />
        </ModalForm>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedTeam(null);
          }}
          onConfirm={handleDelete}
          title="Delete Team"
          message={`Are you sure you want to delete "${selectedTeam?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
        />

        {/* Manage Members Modal */}
        <ModalForm
          isOpen={isMembersModalOpen}
          onClose={() => {
            setIsMembersModalOpen(false);
            setSelectedTeam(null);
            setTeamMembers([]);
            setSelectedUserId("");
          }}
          onSubmit={(e) => {
            e.preventDefault();
            void handleAddMember();
          }}
          title={`Manage Members - ${selectedTeam?.name}`}
          description="Add or remove users from this team."
          isLoading={false}
          size="lg"
        >
          <div className="space-y-4">
            {/* Add Member Section */}
            {availableUsers.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Add User to Team
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email} ({user.email})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!selectedUserId}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Current Members Table */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Team Members ({teamMembers.length})
              </label>
              {loadingMembers ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Loading members...
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  No members in this team yet.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300">
                          Email
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                      {teamMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="px-4 py-2 text-sm text-slate-900 dark:text-slate-100">
                            {member.userName}
                          </td>
                          <td className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                            {member.userEmail}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => handleRemoveMember(member.userId)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                              title="Remove member"
                            >
                              <BiUserMinus className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </ModalForm>
      </div>
    </AuthGuard>
  );
};

export default TeamsPage;
