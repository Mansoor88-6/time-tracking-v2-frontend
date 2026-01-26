"use client";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { FloatingSelect } from "@/components/ui/Input/FloatingSelect";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

type AppService = {
  app_service_id: number; // or string, depending on your API response
  display_name: string;
};
// Define Zod schema for validation
const AppServiceFormSchema = z.object({
  appServiceId: z.string().min(1, "App Service is required"),
  name: z
    .string()
    .min(3, { message: "Section name must be at least 3 characters long" })
    .max(50, { message: "Section name must be at most 50 characters long" })
    .regex(/^[a-z]+(_[a-z]+)*$/, {
      message:
        "Section name must be in snake_case format (e.g., user_management)",
    }),
  displayName: z
    .string()
    .min(3, "Display Name must be at least 3 characters")
    .max(50, "Display Name cannot exceed 50 characters"),
  description: z
    .string()
    .min(3, "Description must be at least 6 characters")
    .max(100, "Description cannot exceed 100 characters"),
});
// Define the form data type based on Zod schema
type SignupFormData = z.infer<typeof AppServiceFormSchema>;
const AddAppServiceSection = ({ onSuccess }: { onSuccess: () => void }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(AppServiceFormSchema),
  });

  const [appServicesSelectField, setAppServicesSelectField] = useState([]);
  const [isLoadingAppServicesSelectField, setIsLoadingAppServicesSelectField] =
    useState(true);
  const [errorAppServicesSelectField, setErrorAppServicesSelectField] =
    useState("");

  // Fetch App Services
  useEffect(() => {
    const fetchAppServices = async () => {
      try {
        const response = await fetch(`${BASE_URL}/app-services/`);
        if (!response.ok) {
          throw new Error("Failed to get services");
        }
        const data = await response.json();
        const options = data.data.map((service: AppService) => ({
          value: service.app_service_id,
          label: service.display_name,
        }));
        setAppServicesSelectField(options);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorAppServicesSelectField(err.message);
        } else {
          setErrorAppServicesSelectField("An error occurred");
        }
      } finally {
        setIsLoadingAppServicesSelectField(false);
      }
    };

    fetchAppServices();
  }, [BASE_URL]);

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    try {
      const payload = {
        ...data,
        appServiceId: Number(data.appServiceId), // Convert to number
      };
      const response = await fetch(`${BASE_URL}/app-service-sections/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create");
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
      <FloatingSelect
        label="App Service"
        id="app_services_select"
        options={
          isLoadingAppServicesSelectField
            ? [{ value: "", label: "Loading..." }]
            : appServicesSelectField.length > 0
            ? appServicesSelectField
            : [{ value: "", label: "No Services available" }]
        }
        {...register("appServiceId")}
        error={errorAppServicesSelectField || errors.appServiceId?.message}
        disabled={
          isLoadingAppServicesSelectField || !!errorAppServicesSelectField
        }
      />
      <FloatingInput
        id="name"
        label="Section Name"
        type="text"
        {...register("name")}
        error={errors.name?.message}
      />

      <FloatingInput
        id="display_name"
        label="Display Name"
        type="text"
        {...register("displayName")}
        error={errors.displayName?.message}
      />

      <FloatingInput
        id="description"
        label="Section Description"
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
          {isSubmitting ? "Creating..." : "Create Service"}
        </button>
      </div>
    </form>
  );
};

export default AddAppServiceSection;

// export default AddUserForm;
