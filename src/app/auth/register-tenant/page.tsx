"use client";

import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-toastify";

type RegisterTenantInputs = {
  name: string;
  email: string;
};

const RegisterTenantPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterTenantInputs>();

  const onSubmit: SubmitHandler<RegisterTenantInputs> = async (data) => {
    try {
      await apiClient("/tenants/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success(
        "Organization registered. Please wait for approval from the platform."
      );
      router.push("/auth/check-status");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to register tenant"
      );
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gray-700 dark:text-gray-200">
          Register Organization
        </h2>
        <p className="mt-0 text-sm text-gray-600 dark:text-gray-400">
          Create a new organization to start tracking time.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FloatingInput
          {...register("name", { required: "Organization name is required" })}
          label="Organization name"
          id="name"
          type="text"
          error={errors.name?.message}
        />
        <FloatingInput
          {...register("email", { required: "Contact email is required" })}
          label="Contact email"
          id="email"
          type="email"
          error={errors.email?.message}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full justify-center rounded-sm border border-transparent bg-primary px-4 py-[0.9rem] text-sm font-medium text-white hover:bg-primary-light disabled:cursor-wait disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Register"}
        </button>
      </form>
    </>
  );
};

export default RegisterTenantPage;

