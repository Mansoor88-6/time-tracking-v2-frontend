"use client";
import { FloatingCheckbox } from "@/components/ui/Input/FloatingCheckbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

// Define Zod schema for validation
const AddAppServicePermissionFormSchema = z.object({
  appServiceIds: z.array(z.string()).min(1, "At least one service is required"),
});

type AppService = {
  app_service_id: number; // or string, depending on your API response
  app_service_display_name: string;
};

type AddAppServicePermissionFormData = z.infer<
  typeof AddAppServicePermissionFormSchema
>;

const AddAppServicePermission = ({ onSuccess }: { onSuccess: () => void }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const { role_uuid } = useParams();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddAppServicePermissionFormData>({
    resolver: zodResolver(AddAppServicePermissionFormSchema),
    defaultValues: {
      appServiceIds: [],
    },
  });

  const [appServicesInCheckbox, setAppServicesInCheckbox] = useState<
    AppService[]
  >([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [isLoadingAppServicesInCheckbox, setIsLoadingAppServicesInCheckbox] =
    useState(true);
  const [errorAppServicesInCheckbox, setErrorAppServicesInCheckbox] =
    useState("");

  useEffect(() => {
    const fetchAppServices = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/app-services/without-permissions/${role_uuid}`
        );
        if (!response.ok) {
          throw new Error("Failed to get services");
        }
        const data = await response.json();
        if (data.servicesData && data.servicesData.length > 0) {
          setAppServicesInCheckbox(data.servicesData);
          setRoleId(data.roleId);
        } else {
          setErrorAppServicesInCheckbox("No services found for the given role");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorAppServicesInCheckbox(err.message);
        } else {
          setErrorAppServicesInCheckbox("An error occurred");
        }
      } finally {
        setIsLoadingAppServicesInCheckbox(false);
      }
    };

    if (role_uuid) {
      fetchAppServices();
    }
  }, [role_uuid, BASE_URL]);

  const onSubmit: SubmitHandler<AddAppServicePermissionFormData> = async (
    data
  ) => {
    try {
      const payload = data.appServiceIds.map((serviceId: string) => ({
        appServiceId: Number(serviceId),
        roleId: roleId,
        hasAccess: true,
      }));

      const response = await fetch(`${BASE_URL}/app-service-permissions/bulk`, {
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
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  // const selectedServices = watch("appServiceIds");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 ${
        isLoadingAppServicesInCheckbox || isSubmitting ? "cursor-wait" : ""
      }`}
    >
      {isLoadingAppServicesInCheckbox ? (
        <p>Loading...</p>
      ) : errorAppServicesInCheckbox ? (
        <p className="text-red-500">{errorAppServicesInCheckbox}</p>
      ) : (
        appServicesInCheckbox.map((service) => (
          <div key={service.app_service_id}>
            <Controller
              name="appServiceIds"
              control={control}
              render={({ field }) => (
                <FloatingCheckbox
                  label={service.app_service_display_name}
                  error={errorAppServicesInCheckbox}
                  checked={field.value.includes(
                    service.app_service_id.toString()
                  )}
                  onChange={(e) => {
                    const value = service.app_service_id.toString();
                    const currentValues = [...field.value];
                    if (e.target.checked) {
                      field.onChange([...currentValues, value]);
                    } else {
                      field.onChange(
                        currentValues.filter((val) => val !== value)
                      );
                    }
                  }}
                  value={service.app_service_id}
                  id={`service-${service.app_service_id}`}
                />
              )}
            />
          </div>
        ))
      )}

      {errors.appServiceIds && (
        <p className="text-red-500">{errors.appServiceIds.message}</p>
      )}

      <div>
        <button
          type="submit"
          className="group relative flex w-full justify-center rounded-sm border border-transparent bg-primary px-4 py-[0.9rem] text-sm font-medium text-white hover:bg-primary-light focus:outline-none focus:ring-0 dark:border-transparent disabled:cursor-wait disabled:opacity-50"
          disabled={
            isSubmitting ||
            isLoadingAppServicesInCheckbox ||
            !!errors.appServiceIds ||
            errorAppServicesInCheckbox ===
              "No services found for the given role"
          }
        >
          {isSubmitting ? "Setting Permissions..." : "Set Service Permissions"}
        </button>
      </div>
    </form>
  );
};

export default AddAppServicePermission;
