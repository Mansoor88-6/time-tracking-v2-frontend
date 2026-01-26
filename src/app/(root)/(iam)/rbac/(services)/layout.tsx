"use client";
import { Suspense } from "react";
import TabLink from "@/components/ui/Tab/TabLink";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useAuth } from "@/hooks/useAuth";
import ContentLoading from "@/components/ui/Loading/ContentLoading";

export default function RbacServicesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const menuItems = [
  //   { path: "app-services", label: "App Services" },
  //   { path: "app-service-sections", label: "Service Sections" },
  //   { path: "app-services-section-components", label: "Section Components" },
  //   { path: "apis", label: "Apis" },
  // ];
  useAuth();

  const permissions = useSelector(
    (state: RootState) => state.rbac.rolePermissions
  );

  // Define all available menu items
  const allMenuItems = [
    { path: "app-services", label: "App Services", section: "app_services" },
    {
      path: "app-service-sections",
      label: "Service Sections",
      section: "app_service_sections",
    },
    {
      path: "app-services-section-components",
      label: "Section Components",
      section: "app_service_section_components",
    },
    { path: "apis", label: "Apis", section: "apis" },
  ];

  // Filter menu items based on allowed sections for "rbac_services"
  const allowedMenuItems = (() => {
    const service = permissions.find(
      (service) => service.service_name === "rbac"
    );
    if (!service) return [];

    const allowedSections = service.service_sections.map(
      (section) => section.section_name
    );

    return allMenuItems.filter((item) =>
      allowedSections.includes(item.section)
    );
  })();

  return (
    <div>
      {/* Render the menu and children */}
      <TabLink
        basePath="/rbac/services"
        menuItems={allowedMenuItems.map((item) => ({
          ...item,
          title: item.label,
        }))}
        title={"App Services"}
      />
      <div className=" bg-white dark:bg-gray-900 border-t border-slate-500">
        <Suspense fallback={<ContentLoading />}>{children}</Suspense>
      </div>
    </div>
  );
}
