"use client";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

// Define Zod schema for validation
const signupSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),
  description: z
    .string()
    .min(3, "Description must be at least 6 characters")
    .max(100, "Description cannot exceed 100 characters"),
});
// Define the form data type based on Zod schema
type SignupFormData = z.infer<typeof signupSchema>;
const AddRole = ({ onSuccess }: { onSuccess: () => void }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/roles/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create role");
      }

      const responseData = await response.json();
      toast.success(responseData.message);

      // Close modal using onSuccess callback
      onSuccess();

      // Optionally redirect or perform other actions
      //   router.push("/users");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FloatingInput
        id="name"
        label="Role Name"
        type="text"
        {...register("name")}
        error={errors.name?.message}
      />

      <FloatingInput
        id="description"
        label="Role Description"
        type="text"
        {...register("description")}
        error={errors.description?.message}
      />

      <div>
        <button
          type="submit"
          className="group relative flex w-full justify-center rounded-sm border border-transparent bg-primary px-4 py-[0.9rem] text-sm font-medium text-white hover:bg-primary-light focus:outline-none focus:ring-0 dark:border-transparent disabled:cursor-wait disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Role"}
        </button>
      </div>
    </form>
  );
};

export default AddRole;

// export default AddUserForm;
