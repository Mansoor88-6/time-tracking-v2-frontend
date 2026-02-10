"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { invitationsApi } from "@/lib/api/invitations";
import { teamsApi } from "@/lib/api/teams";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { toast } from "react-toastify";
import { Team } from "@/lib/api/teams";
import { UserRole } from "@/types/auth/auth";

interface InviteFormInputs {
  email: string;
  role: string;
  teamIds?: number[];
}

interface Invitation {
  id: number;
  email: string;
  role: string;
  teamIds?: number[];
  createdAt: string;
  acceptedAt?: string | null;
}

const InvitationsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<InviteFormInputs>();

  const watchedTeamIds = watch("teamIds") || [];

  // Fetch available teams
  useEffect(() => {
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
    void loadTeams();
  }, []);

  // Load invitations (if backend supports it)
  useEffect(() => {
    const loadInvitations = async () => {
      if (!user?.tenantId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Try to load invitations - may fail if endpoint doesn't exist yet
        try {
          const data = await invitationsApi.list(user.tenantId);
          setInvitations(data);
        } catch {
          // Endpoint may not exist yet, that's okay
          setInvitations([]);
        }
      } catch (err) {
        console.error("Failed to load invitations:", err);
        setInvitations([]);
      } finally {
        setLoading(false);
      }
    };
    void loadInvitations();
  }, [user?.tenantId]);

  const toggleTeam = (teamId: number) => {
    const current = watchedTeamIds || [];
    if (current.includes(teamId)) {
      setValue(
        "teamIds",
        current.filter((id) => id !== teamId)
      );
    } else {
      setValue("teamIds", [...current, teamId]);
    }
  };

  const onSubmit = async (data: InviteFormInputs) => {
    if (!user?.tenantId) {
      toast.error("Missing tenant context");
      return;
    }

    try {
      await invitationsApi.create(user.tenantId, {
        email: data.email,
        role: data.role,
        teamIds: data.teamIds || [],
      });

      toast.success("Invitation sent successfully");
      reset();
      setIsModalOpen(false);
      
      // Reload invitations if available
      if (user.tenantId) {
        try {
          const updated = await invitationsApi.list(user.tenantId);
          setInvitations(updated);
        } catch {
          // Ignore if endpoint doesn't exist
        }
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send invitation"
      );
    }
  };

  const columns: AdminTableColumn<Invitation>[] = [
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
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
    {
      key: "acceptedAt",
      label: "Status",
      render: (row) =>
        row.acceptedAt ? (
          <span className="text-green-600 dark:text-green-400">Accepted</span>
        ) : (
          <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
        ),
    },
  ];

  return (
    <AuthGuard requiredRoles={[UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]}>
      <div className="space-y-6">
        <PageHeader
          title="Invitations"
          description="Invite new users to your organization by email, role, and optional team assignments."
          primaryAction={{
            label: "Send Invitation",
            onClick: () => setIsModalOpen(true),
            icon: <BiPlus className="w-4 h-4" />,
          }}
        />

        {/* Send Invitation Form Modal */}
        <ModalForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            reset();
          }}
          onSubmit={handleSubmit(onSubmit)}
          title="Send Invitation"
          description="Invite a new user to your organization."
          isLoading={isSubmitting}
          size="md"
        >
          <FloatingInput
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            label="Email"
            id="invite-email"
            type="email"
            error={errors.email?.message}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              {...register("role", { required: "Role is required" })}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a role</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="TEAM_MANAGER">Team Manager</option>
              <option value="VIEWER">Viewer</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.role.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Teams (optional)
            </label>
            {loadingTeams ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Loading teams...
              </p>
            ) : teams.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No teams available. Create teams first.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-700 rounded-md p-2">
                {teams.map((team) => (
                  <label
                    key={team.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={watchedTeamIds.includes(team.id)}
                      onChange={() => toggleTeam(team.id)}
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

        {/* Invitations List */}
        {invitations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Recent Invitations
            </h2>
            <AdminDataTable
              data={invitations}
              columns={columns}
              loading={loading}
              emptyMessage="No invitations sent yet."
            />
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default InvitationsPage;
