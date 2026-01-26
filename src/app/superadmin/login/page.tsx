"use client";

import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { CustomLink } from "@/components/ui/Link/Link";
import { loginUser } from "@/redux/features/auth/authThunks";
import { AppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { AiOutlineLoading } from "react-icons/ai";

type SuperAdminLoginInputs = {
  email: string;
  password: string;
};

const SuperAdminLoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SuperAdminLoginInputs>();

  const onSubmit: SubmitHandler<SuperAdminLoginInputs> = async (data) => {
    try {
      await dispatch(
        loginUser({
          email: data.email,
          password: data.password,
          userType: "superadmin",
        })
      ).unwrap();
      router.push("/superadmin");
    } catch (error) {
      console.error("Super-admin login failed:", error);
      toast.error(String(error));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-lg shadow-md p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Super Admin Login
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Sign in to manage tenants and platform settings.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FloatingInput
            {...register("email", { required: "Email is required" })}
            label="Email"
            id="superadmin-email"
            type="email"
            error={errors.email?.message}
          />
          <FloatingInput
            {...register("password", { required: "Password is required" })}
            label="Password"
            id="superadmin-password"
            type="password"
            error={errors.password?.message}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50 disabled:cursor-wait"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <AiOutlineLoading className="animate-spin h-5 w-5 mr-2" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <p className="text-xs text-slate-500">
          Regular users should use the{" "}
          <CustomLink href="/auth/login" color="primary">
            organization login
          </CustomLink>
          .
        </p>
      </div>
    </div>
  );
};

export default SuperAdminLoginPage;
