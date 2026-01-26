// "use client";

// import { useAuth } from "./useAuth";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";

// interface Permission {
//   can_read: boolean;
//   can_write: boolean;
//   can_update: boolean;
//   can_delete: boolean;
//   can_export: boolean;
//   can_publish: boolean;
// }

// interface ComponentPermissions {
//   component_name: string;
//   permissions: Permission;
// }

// interface Section {
//   section_name: string;
//   components: ComponentPermissions[];
// }

// interface ServicePermissions {
//   service_name: string;
//   service_sections: Section[];
// }

// export const useRBAC = () => {
//   const { isLoading: authLoading } = useAuth();
//   const router = useRouter();

//   const permissions = useSelector(
//     (state: RootState) => state.rbac.rolePermissions,
//     (prev, next) => prev === next
//   );

//   const isPermissionsLoading = permissions.length === 0;

//   // ----- Helpers
//   const getService = (serviceName: string) =>
//     permissions.find((service) => service.service_name === serviceName);

//   const getSection = (serviceName: string, sectionName: string) => {
//     const service = getService(serviceName);
//     return service?.service_sections.find(
//       (section) => section.section_name === sectionName
//     );
//   };

//   const getComponent = (
//     serviceName: string,
//     sectionName: string,
//     componentName: string
//   ) => {
//     const section = getSection(serviceName, sectionName);
//     return section?.components.find(
//       (comp) => comp.component_name === componentName
//     );
//   };

//   // ----- Public API
//   const hasServiceAccess = (serviceName: string): boolean => {
//     if (authLoading || isPermissionsLoading) return false;
//     const serviceData = getService(serviceName);
//     return !!serviceData;
//   };

//   const hasSectionAccess = (
//     serviceName: string,
//     sectionName: string
//   ): boolean => {
//     if (!hasServiceAccess(serviceName)) return false;
//     const sectionData = getSection(serviceName, sectionName);
//     return !!sectionData;
//   };

//   const hasComponentAccess = (
//     serviceName: string,
//     sectionName: string,
//     componentName: string
//   ): Permission => {
//     if (!hasSectionAccess(serviceName, sectionName)) {
//       return {
//         can_read: false,
//         can_write: false,
//         can_update: false,
//         can_delete: false,
//         can_export: false,
//         can_publish: false,
//       };
//     }
//     const component = getComponent(serviceName, sectionName, componentName);
//     if (!component) {
//       return {
//         can_read: false,
//         can_write: false,
//         can_update: false,
//         can_delete: false,
//         can_export: false,
//         can_publish: false,
//       };
//     }
//     return component.permissions;
//   };

//   useEffect(() => {
//     // Optional: If there's a certain service that must be accessible, you can redirect if not accessible
//     // Example: if "users" is your main service, do:
//     // if (!authLoading && !isPermissionsLoading) {
//     //   if (!hasServiceAccess("users")) {
//     //     router.back();
//     //   }
//     // }
//   }, [authLoading, isPermissionsLoading, permissions, router]);

//   return {
//     isLoading: authLoading || isPermissionsLoading,
//     hasServiceAccess,
//     hasSectionAccess,
//     hasComponentAccess,
//   };
// };

"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Permission {
  can_read: boolean;
  can_write: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_publish: boolean;
}

interface ComponentPermissions {
  component_name: string;
  permissions: Permission;
}

interface Section {
  section_name: string;
  components: ComponentPermissions[];
}

interface ServicePermissions {
  service_name: string;
  service_sections: Section[];
}

export const useRBAC = () => {
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();

  const permissions: ServicePermissions[] = useSelector(
    (state: RootState) => state.rbac.rolePermissions,
    (prev, next) => prev === next
  );

  const isPermissionsLoading = permissions.length === 0;

  // ----- Helpers
  const getService = (serviceName: string) =>
    permissions.find((service) => service.service_name === serviceName);

  const getSection = (serviceName: string, sectionName: string) => {
    const service = getService(serviceName);
    return service?.service_sections.find(
      (section) => section.section_name === sectionName
    );
  };

  const getComponent = (
    serviceName: string,
    sectionName: string,
    componentName: string
  ) => {
    const section = getSection(serviceName, sectionName);
    return section?.components.find(
      (comp) => comp.component_name === componentName
    );
  };

  // ----- Public API
  const hasServiceAccess = (serviceName: string): boolean => {
    if (authLoading || isPermissionsLoading) return false;
    const serviceData = getService(serviceName);
    return !!serviceData;
  };

  const hasSectionAccess = (
    serviceName: string,
    sectionName: string
  ): boolean => {
    if (!hasServiceAccess(serviceName)) return false;
    const sectionData = getSection(serviceName, sectionName);
    return !!sectionData;
  };

  const hasComponentAccess = (
    serviceName: string,
    sectionName: string,
    componentName: string
  ): Permission => {
    if (!hasSectionAccess(serviceName, sectionName)) {
      return {
        can_read: false,
        can_write: false,
        can_update: false,
        can_delete: false,
        can_export: false,
        can_publish: false,
      };
    }
    const component = getComponent(serviceName, sectionName, componentName);
    if (!component) {
      return {
        can_read: false,
        can_write: false,
        can_update: false,
        can_delete: false,
        can_export: false,
        can_publish: false,
      };
    }
    return component.permissions;
  };

  useEffect(() => {
    // Optional: If there's a certain service that must be accessible, you can redirect if not accessible
    // Example: if "users" is your main service, do:
    // if (!authLoading && !isPermissionsLoading) {
    //   if (!hasServiceAccess("users")) {
    //     router.back();
    //   }
    // }
  }, [authLoading, isPermissionsLoading, permissions, router]);

  return {
    isLoading: authLoading || isPermissionsLoading,
    hasServiceAccess,
    hasSectionAccess,
    hasComponentAccess,
  };
};
