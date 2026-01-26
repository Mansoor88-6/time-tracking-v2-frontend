"use client";
import { Checkbox } from "@/components/ui/Input/Checkbox";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { CustomLink } from "@/components/ui/Link/Link";
import { loginUser } from "@/redux/features/auth/authThunks";
import { AppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { AiOutlineLoading } from "react-icons/ai";
import SocialLogin from "@/components/auth/SocialLogin";

// Define the type for your form inputs
type LoginFormInputs = {
  email: string;
  password: string;
  userType: "user" | "superadmin";
};

const Signin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  // Use `useForm` with the `LoginFormInputs` type
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await dispatch(
        loginUser({
          email: data.email,
          password: data.password,
          userType: "user",
        })
      ).unwrap();
      router.push("/dashboard"); // Redirect to org dashboard after successful login
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(String(error)); // Show error toast if login fails
    }
  };

  return (
    <>
      <div className=" mb-8">
        <h2 className=" text-2xl font-extrabold text-gray-700 dark:text-gray-200">
          Let&apos;s Get Started
        </h2>
        <p className="mt-0 text-sm text-gray-600 dark:text-gray-400">
          Sign in to continue
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FloatingInput
          {...register("email", { required: "Email is required to login" })}
          label={"Email"}
          id="email"
          type="email"
          error={errors.email && errors.email.message}
        />

        <FloatingInput
          {...register("password", { required: "Password is required" })}
          label={"Password"}
          id="password"
          type="password"
          error={errors.password && errors.password.message}
        />
        {/* Remember me / Forgot Password */}
        <div className="flex items-center justify-between">
          <Checkbox id="rememer" label="Remember me" />
          <CustomLink
            href="/auth/forgot-password"
            color="primary"
            className="font-semibold text-sm text-primary hover:text-primary-light"
          >
            Forgot your password?
          </CustomLink>
        </div>

        {/* Signin Button */}

        <div>
          <button
            data-testid="login"
            type="submit"
            disabled={isSubmitting} // Disable button when submitting
            className={`group relative flex w-full justify-center rounded-sm border border-transparent bg-primary px-4 py-[0.9rem] text-sm font-medium text-white hover:bg-primary-light focus:outline-none focus:ring-0 dark:border-transparent disabled:cursor-wait disabled:opacity-50`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <AiOutlineLoading
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  size={20}
                />
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </div>
      </form>

      {/* Dont have an account */}
      <div className="m-auto mt-5 w-fit md:mt-5">
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <CustomLink
            href="/auth/register-tenant"
            color="primary"
            className="font-medium text-primary hover:text-primary-light "
          >
            Sign Up
          </CustomLink>
        </p>
      </div>
      <SocialLogin />
    </>
  );
};

export default Signin;
