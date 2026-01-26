"use client";
import { FloatingCheckbox } from "@/components/ui/Input/FloatingCheckbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

interface ServicePermission {
  as_permission_id: number;
  has_access: boolean;
  app_service_id_fk: number;
  role_id_fk: number;
  display_name: string;
}

interface PermissionState {
  asPermissionId: number;
  hasAccess: boolean;
}

const UpdateAppServicePermissionFormSchema = z.object({
  permissions: z.array(
    z.object({
      asPermissionId: z.number(),
      hasAccess: z.boolean(),
    })
  ),
});

type UpdateAppServicePermissionFormData = z.infer<
  typeof UpdateAppServicePermissionFormSchema
>;

const UpdateAppServicePermission = ({
  onSuccess,
}: {
  onSuccess: () => void;
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const { role_uuid } = useParams();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<UpdateAppServicePermissionFormData>({
    resolver: zodResolver(UpdateAppServicePermissionFormSchema),
    defaultValues: {
      permissions: [],
    },
  });

  const [services, setServices] = useState<ServicePermission[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<
    PermissionState[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Watch all permissions for changes
  const currentPermissions = watch("permissions");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/app-service-permissions/with-permissions/${role_uuid}`
        );
        if (!response.ok) throw new Error("Failed to fetch services");
        const data = await response.json();

        if (data.servicesData?.length > 0) {
          setServices(data.servicesData);

          const initialPermissions = data.servicesData.map(
            (service: ServicePermission) => ({
              asPermissionId: Number(service.as_permission_id),
              hasAccess: Boolean(service.has_access),
            })
          );

          // Store original permissions for comparison
          setOriginalPermissions(initialPermissions);

          // Set form values
          setValue("permissions", initialPermissions);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (role_uuid) fetchServices();
  }, [role_uuid, setValue,BASE_URL]);

  const onSubmit: SubmitHandler<UpdateAppServicePermissionFormData> = async (
    data
  ) => {
    try {
      // Compare current permissions with original permissions to find changes
      const changedPermissions = data.permissions.filter(
        (permission, index) => {
          const original = originalPermissions[index];
          return permission.hasAccess !== original.hasAccess;
        }
      );

      // If no changes, show message and return
      if (changedPermissions.length === 0) {
        toast.info("No changes to update");
        onSuccess();
        return;
      }
      console.log(changedPermissions);
      const response = await fetch(`${BASE_URL}/app-service-permissions/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedPermissions),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      const responseData = await response.json();
      toast.success(responseData.message);
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Calculate number of changes
  const changedCount = currentPermissions.filter(
    (permission, index) =>
      permission.hasAccess !== originalPermissions[index]?.hasAccess
  ).length;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 ${isSubmitting ? "cursor-wait" : ""}`}
    >
      {services.map((service, index) => (
        <div key={service.as_permission_id}>
          <Controller
            name={`permissions.${index}`}
            control={control}
            defaultValue={{
              asPermissionId: Number(service.as_permission_id),
              hasAccess: Boolean(service.has_access),
            }}
            render={({ field }) => (
              <FloatingCheckbox
                label={service.display_name}
                checked={field.value.hasAccess}
                onChange={(e) => {
                  field.onChange({
                    asPermissionId: field.value.asPermissionId,
                    hasAccess: Boolean(e.target.checked),
                  });
                }}
                id={`service-${service.as_permission_id}`}
              />
            )}
          />
        </div>
      ))}

      {errors.permissions && (
        <p className="text-red-500">{errors.permissions.message}</p>
      )}

      <button
        type="submit"
        className="group relative flex w-full justify-center rounded-sm border border-transparent bg-primary px-4 py-[0.9rem] text-sm font-medium text-white hover:bg-primary-light focus:outline-none focus:ring-0 dark:border-transparent disabled:cursor-wait disabled:opacity-50"
        disabled={isSubmitting || changedCount === 0}
      >
        {isSubmitting
          ? "Updating Permissions..."
          : changedCount > 0
          ? `Update ${changedCount} Permission${changedCount > 1 ? "s" : ""}`
          : "No Changes to Update"}
      </button>
    </form>
  );
};

export default UpdateAppServicePermission;
