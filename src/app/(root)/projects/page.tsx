"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ModalForm } from "@/components/admin/ModalForm";
import { projectsApi, Project } from "@/lib/api/projects";
import { teamsApi } from "@/lib/api/teams";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { BiPlus, BiEdit, BiTrash } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { FloatingTextarea } from "@/components/ui/Input/FloatingTextarea";
import { toast } from "react-toastify";
import { Team } from "@/lib/api/teams";

interface ProjectFormData {
  name: string;
  description?: string;
  teamId?: string;
}

const ProjectsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const canEdit = user?.role === "ORG_ADMIN" || user?.role === "TEAM_MANAGER";

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
  } = useForm<ProjectFormData>();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<ProjectFormData>();

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.list();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      setLoadingTeams(true);
      const data = await teamsApi.list();
      setTeams(data);
    } catch (err) {
      console.error("Failed to load teams:", err);
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    void loadProjects();
    void loadTeams();
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (data: ProjectFormData) => {
    try {
      await projectsApi.create({
        name: data.name,
        description: data.description,
        teamId: data.teamId ? parseInt(data.teamId) : undefined,
      });
      toast.success("Project created successfully");
      setIsCreateModalOpen(false);
      resetCreate();
      await loadProjects();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create project"
      );
    }
  };

  const handleEdit = async (data: ProjectFormData) => {
    if (!selectedProject) return;
    try {
      await projectsApi.update(selectedProject.id, {
        name: data.name,
        description: data.description,
        teamId: data.teamId ? parseInt(data.teamId) : null,
      });
      toast.success("Project updated successfully");
      setIsEditModalOpen(false);
      setSelectedProject(null);
      resetEdit();
      await loadProjects();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update project"
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      await projectsApi.delete(selectedProject.id);
      toast.success("Project deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      await loadProjects();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete project"
      );
    }
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    resetEdit({
      name: project.name,
      description: project.description || "",
      teamId: project.teamId?.toString() || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const getTeamName = (teamId: number | null | undefined) => {
    if (!teamId) return "Unassigned";
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : `Team #${teamId}`;
  };

  const columns: AdminTableColumn<Project>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
      render: (row) => row.description || "—",
    },
    {
      key: "teamId",
      label: "Team",
      sortable: true,
      render: (row) => getTeamName(row.teamId),
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
    <AuthGuard>
      <div className="space-y-4">
        <PageHeader
          title="Projects"
          description="Manage projects and track their progress. Assign projects to teams for better organization."
          primaryAction={
            canEdit
              ? {
                  label: "New Project",
                  onClick: () => setIsCreateModalOpen(true),
                  icon: <BiPlus className="w-4 h-4" />,
                }
              : undefined
          }
        />

        <DataToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search projects..."
        />

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <AdminDataTable
          data={filteredProjects}
          columns={columns}
          loading={loading}
          emptyMessage="No projects found. Create your first project to get started."
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
                      title="Edit project"
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
                        title="Delete project"
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
          title="Create Project"
          description="Add a new project to your organization."
          isLoading={isSubmittingCreate}
          size="lg"
        >
          <FloatingInput
            {...registerCreate("name", { required: "Project name is required" })}
            label="Project Name"
            id="project-name"
            type="text"
            error={errorsCreate.name?.message}
          />
          <FloatingTextarea
            {...registerCreate("description")}
            label="Description (optional)"
            id="project-description"
            error={errorsCreate.description?.message}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Team (optional)
            </label>
            <select
              {...registerCreate("teamId")}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loadingTeams}
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </ModalForm>

        {/* Edit Modal */}
        <ModalForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProject(null);
            resetEdit();
          }}
          onSubmit={handleSubmitEdit(handleEdit)}
          title="Edit Project"
          description="Update project information."
          isLoading={isSubmittingEdit}
          size="lg"
        >
          <FloatingInput
            {...registerEdit("name", { required: "Project name is required" })}
            label="Project Name"
            id="edit-project-name"
            type="text"
            error={errorsEdit.name?.message}
          />
          <FloatingTextarea
            {...registerEdit("description")}
            label="Description (optional)"
            id="edit-project-description"
            error={errorsEdit.description?.message}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Team (optional)
            </label>
            <select
              {...registerEdit("teamId")}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loadingTeams}
            >
              <option value="">Unassigned</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </ModalForm>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedProject(null);
          }}
          onConfirm={handleDelete}
          title="Delete Project"
          message={`Are you sure you want to delete "${selectedProject?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
        />
      </div>
    </AuthGuard>
  );
};

export default ProjectsPage;
