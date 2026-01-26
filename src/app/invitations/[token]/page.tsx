"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface InvitationSummary {
  email: string;
  tenantName: string;
  role: string;
}

type AcceptInviteInputs = {
  name: string;
  password: string;
};

const InvitationAcceptPage = () => {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token;

  const [invitation, setInvitation] = useState<InvitationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteInputs>();

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await apiClient<InvitationSummary>(
          `/invitations/${token}`
        );
        setInvitation(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load invitation"
        );
      } finally {
        setLoading(false);
      }
    };

    void loadInvitation();
  }, [token]);

  const onSubmit: SubmitHandler<AcceptInviteInputs> = async (formData) => {
    if (!token) return;
    try {
      await apiClient(`/invitations/${token}/accept`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success("Invitation accepted. You can now log in.");
      router.replace("/auth/login");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to accept invitation"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-lg shadow-md p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Accept Invitation
          </h1>
        </div>

        {loading ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Loading invitation details...
          </p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : !invitation ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Invitation not found or has expired.
          </p>
        ) : (
          <>
            <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <p>
                You have been invited to join{" "}
                <span className="font-semibold">{invitation.tenantName}</span>
                .
              </p>
              <p>
                Email: <span className="font-mono">{invitation.email}</span>
              </p>
              <p>Role: {invitation.role}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FloatingInput
                {...register("name", { required: "Name is required" })}
                label="Full Name"
                id="invite-name"
                type="text"
                error={errors.name?.message}
              />
              <FloatingInput
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                label="Password"
                id="invite-password"
                type="password"
                error={errors.password?.message}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50 disabled:cursor-wait"
              >
                {isSubmitting ? "Submitting..." : "Create Account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default InvitationAcceptPage;

