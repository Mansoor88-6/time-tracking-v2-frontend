"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-toastify";

type ResetPasswordInputs = {
  password: string;
};

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInputs>();

  const onSubmit: SubmitHandler<ResetPasswordInputs> = async (data) => {
    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }

    try {
      await apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: data.password }),
      });
      toast.success("Password reset successfully. You can now log in.");
      router.push("/auth/login");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reset password"
      );
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gray-700 dark:text-gray-200">
          Choose a new password
        </h2>
        <p className="mt-0 text-sm text-gray-600 dark:text-gray-400">
          Enter a strong password for your account.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FloatingInput
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Minimum 8 characters" },
          })}
          label="New password"
          id="password"
          type="password"
          error={errors.password?.message}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full justify-center rounded-sm border border-transparent bg-primary px-4 py-[0.9rem] text-sm font-medium text-white hover:bg-primary-light disabled:cursor-wait disabled:opacity-50"
        >
          {isSubmitting ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </>
  );
};

export default ResetPasswordPage;

