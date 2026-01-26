"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/features/auth/authSlice";
import { AuthResponse } from "@/types/auth/auth";
import { useEffect } from "react";

type SetupPasswordInputs = {
  name: string;
  password: string;
};

const SetupPasswordPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const email = searchParams.get("email") || "";

  // Ensure we always have an email from the previous step; otherwise redirect back
  useEffect(() => {
    if (!email) {
      router.replace("/auth/check-status");
    }
  }, [email, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupPasswordInputs>({
    defaultValues: { name: "", password: "" },
  });

  const onSubmit: SubmitHandler<SetupPasswordInputs> = async (data) => {
    try {
      const res = await apiClient<AuthResponse>("/tenants/setup-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          name: data.name,
          password: data.password,
        }),
      });

      // store user and tokens
      dispatch(setUser(res.user));
      // tokens are handled via login thunk; here we can also set them manually if desired
      toast.success("Account created successfully");
      router.push("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to set up password"
      );
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gray-700 dark:text-gray-200">
          Set up your account
        </h2>
        <p className="mt-0 text-sm text-gray-600 dark:text-gray-400">
          Complete your organization admin account for{" "}
          <span className="font-semibold">{email}</span>.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FloatingInput
          label="Full name"
          id="name"
          type="text"
          {...register("name", { required: "Name is required" })}
          error={errors.name?.message}
        />
        <FloatingInput
          label="Password"
          id="password"
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Minimum 8 characters" },
          })}
          error={errors.password?.message}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full justify-center rounded-sm border border-transparent bg-primary px-4 py-[0.9rem] text-sm font-medium text-white hover:bg-primary-light disabled:cursor-wait disabled:opacity-50"
        >
          {isSubmitting ? "Setting up..." : "Create account"}
        </button>
      </form>
    </>
  );
};

export default SetupPasswordPage;

