"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-toastify";

type ForgotPasswordInputs = {
  email: string;
};

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>();

  const onSubmit: SubmitHandler<ForgotPasswordInputs> = async (data) => {
    try {
      await apiClient("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: data.email }),
      });
      toast.success(
        "If an account exists for that email, you will receive a reset link shortly."
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to request password reset"
      );
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gray-700 dark:text-gray-200">
          Reset your password
        </h2>
        <p className="mt-0 text-sm text-gray-600 dark:text-gray-400">
          Enter your email and we&apos;ll send you a password reset link.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FloatingInput
          {...register("email", { required: "Email is required" })}
          label="Email"
          id="email"
          type="email"
          error={errors.email?.message}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full justify-center rounded-sm border border-transparent bg-primary px-4 py-[0.9rem] text-sm font-medium text-white hover:bg-primary-light disabled:cursor-wait disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </>
  );
};

export default ForgotPasswordPage;

