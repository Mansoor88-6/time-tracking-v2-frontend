"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ModalForm } from "@/components/admin/ModalForm";
import { teamsApi, Team } from "@/lib/api/teams";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { BiPlus, BiEdit, BiTrash } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { toast } from "react-toastify";

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
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const allowedRoles = ["ORG_ADMIN", "TEAM_MANAGER", "VIEWER"];
  const isAllowed = user && allowedRoles.includes(user.role);
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
    if (!isAllowed) {
      setLoading(false);
      return;
    }
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

  useEffect(() => {
    void loadTeams();
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
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString()
          : "—",
    },
  ];

  if (!isAllowed) {
    return (
      <AuthGuard>
        <div className="space-y-4">
          <PageHeader
            title="Teams"
            description="You do not have permission to view teams."
          />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
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
      </div>
    </AuthGuard>
  );
};

export default TeamsPage;
