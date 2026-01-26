"use client";
import { FloatingCheckbox } from "@/components/ui/Input/FloatingCheckbox";
import { FloatingSelect } from "@/components/ui/Input/FloatingSelect";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

type AppServiceSectionPermissions = {
  app_service_id: number; // or string, depending on your API response
  display_name: string;
};

type AppServiceSectionCheckBoxPermissions = {
  app_service_sec_id: number; // or string, depending on your API response
  display_name: string;
};
// Define Zod schema for validation
const AppServiceFormSchema = z.object({
  appServiceId: z.string().min(1, "App Service is required"),
  appServiceSectionsIds: z
    .array(z.string())
    .min(1, "At least one service section is required"),
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

type ServiceSectionPermissionFormData = z.infer<typeof AppServiceFormSchema>;

const AddAppServiceSectionPermission = ({
  onSuccess,
}: {
  onSuccess: () => void;
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const { role_uuid } = useParams();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ServiceSectionPermissionFormData>({
    resolver: zodResolver(AppServiceFormSchema),
    defaultValues: {
      appServiceSectionsIds: [], // Initialize as an empty array
      appServiceId: "", // Ensure appServiceId is also initialized
      name: "", // Initialize other fields as needed
      displayName: "",
      description: "",
    },
  });

  const [appServicesSelectField, setAppServicesSelectField] = useState([]);
  const [isLoadingAppServicesSelectField, setIsLoadingAppServicesSelectField] =
    useState(true);
  const [errorAppServicesSelectField, setErrorAppServicesSelectField] =
    useState("");

  const [appServiceSectionsInCheckbox, setAppServiceSectionsInCheckbox] =
    useState<AppServiceSectionCheckBoxPermissions[]>([]);
  const [
    isLoadingAppServiceSectionsInCheckbox,
    setIsLoadingAppServiceSectionsInCheckbox,
  ] = useState(false);
  const [
    errorAppServiceSectionsInCheckbox,
    setErrorAppServiceSectionsInCheckbox,
  ] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);

  const selectedAppServiceId = watch("appServiceId");

  // Fetch App Services
  useEffect(() => {
    const fetchAllowedAppServices = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/app-services/allowed-services/${role_uuid}`
        );
        if (!response.ok) {
          throw new Error("Failed to get services");
        }
        const data = await response.json();
        if (data.servicesData && data.servicesData.length > 0) {
          const options = data.servicesData.map(
            (service: AppServiceSectionPermissions) => ({
              value: service.app_service_id,
              label: service.display_name,
            })
          );
          setAppServicesSelectField(options);
          setRoleId(data.roleId);
        } else {
          setErrorAppServicesSelectField("No services found for given role");
        }
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

    fetchAllowedAppServices();
  }, [role_uuid, BASE_URL]);

  // Fetch App Service Sections on service change
  useEffect(() => {
    const fetchAppServiceSections = async () => {
      if (!selectedAppServiceId) return;

      setIsLoadingAppServiceSectionsInCheckbox(true);
      setErrorAppServiceSectionsInCheckbox("");

      try {
        const response = await fetch(
          `${BASE_URL}/app-service-sections/allowed?roleId=${roleId}&serviceId=${selectedAppServiceId}`
        );
        if (!response.ok) {
          throw new Error("Failed to get service sections");
        }
        const data = await response.json();
        if (data.serviceSectionsData && data.serviceSectionsData.length > 0) {
          setAppServiceSectionsInCheckbox(data.serviceSectionsData);
        } else {
          setErrorAppServiceSectionsInCheckbox(
            "No service sections found for the selected service"
          );
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorAppServiceSectionsInCheckbox(err.message);
        } else {
          setErrorAppServiceSectionsInCheckbox("An error occurred");
        }
      } finally {
        setIsLoadingAppServiceSectionsInCheckbox(false);
      }
    };

    fetchAppServiceSections();
  }, [selectedAppServiceId, role_uuid, roleId, BASE_URL]);

  const onSubmit: SubmitHandler<ServiceSectionPermissionFormData> = async (
    data
  ) => {
    try {
      const payload = {
        ...data,
        appServiceId: Number(data.appServiceId),
      };
      console.log(payload);
      const response = await fetch(
        `${BASE_URL}/app-service-sections-permission/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

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
        disabled={isLoadingAppServicesSelectField}
      />

      {isLoadingAppServiceSectionsInCheckbox ? (
        <p>Loading...</p>
      ) : errorAppServiceSectionsInCheckbox ? (
        <p className="text-red-500">{errorAppServiceSectionsInCheckbox}</p>
      ) : (
        appServiceSectionsInCheckbox.map((section) => (
          <Controller
            key={section.app_service_sec_id}
            name="appServiceSectionsIds"
            control={control}
            render={({ field }) => (
              <FloatingCheckbox
                label={section.display_name}
                error={errors.appServiceSectionsIds?.message}
                onChange={(e) => {
                  const value = section.app_service_sec_id.toString();
                  const currentValues = Array.isArray(field.value)
                    ? [...field.value]
                    : []; // Ensure currentValues is an array
                  if (e.target.checked) {
                    field.onChange([...currentValues, value]);
                  } else {
                    field.onChange(
                      currentValues.filter((val) => val !== value)
                    );
                  }
                }}
                value={section.app_service_sec_id}
                id={`section-${section.app_service_sec_id}`}
              />
            )}
          />
        ))
      )}

      <div>
        <button
          type="submit"
          className="group relative flex w-full justify-center rounded-sm border border-transparent bg-primary px-4 py-[0.9rem] text-sm font-medium text-white hover:bg-primary-light focus:outline-none disabled:cursor-wait disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Service"}
        </button>
      </div>
    </form>
  );
};

export default AddAppServiceSectionPermission;
