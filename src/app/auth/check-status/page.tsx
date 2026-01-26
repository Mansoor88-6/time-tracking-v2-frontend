"use client";

import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-toastify";

type CheckStatusInputs = {
  email: string;
};

type StatusResponse = {
  status: string;
  tenantId: number;
  tenantName: string;
  canSetupPassword: boolean;
  message: string;
};

const CheckStatusPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CheckStatusInputs>();

  const onSubmit: SubmitHandler<CheckStatusInputs> = async (data) => {
    try {
      const res = await apiClient<StatusResponse>("/tenants/check-status", {
        method: "POST",
        body: JSON.stringify({ email: data.email }),
      });
      toast.info(res.message);

      if (res.canSetupPassword) {
        router.push(`/auth/setup-password?email=${encodeURIComponent(data.email)}`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to check status"
      );
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gray-700 dark:text-gray-200">
          Check Organization Status
        </h2>
        <p className="mt-0 text-sm text-gray-600 dark:text-gray-400">
          Enter your registration email to see if your organization is approved.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FloatingInput
          {...register("email", { required: "Email is required" })}
          label="Organization email"
          id="email"
          type="email"
          error={errors.email?.message}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full justify-center rounded-sm border border-transparent bg-primary px-4 py-[0.9rem] text-sm font-medium text-white hover:bg-primary-light disabled:cursor-wait disabled:opacity-50"
        >
          {isSubmitting ? "Checking..." : "Check status"}
        </button>
      </form>
    </>
  );
};

export default CheckStatusPage;

