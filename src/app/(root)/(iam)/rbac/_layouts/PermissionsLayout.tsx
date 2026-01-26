"use client";
import React, { Suspense } from "react";
import TabLink from "@/components/ui/Tab/TabLink";
import {useParams} from "next/navigation";
import ContentLoading from "@/components/ui/Loading/ContentLoading";
// import { useParams, usePathname, useRouter } from "next/navigation";

export default function RbacRolesPermissionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const {role_uuid} = useParams()

    const menuItems = [
      { path: `${role_uuid}/services`, label: "App Services" },
      {
        path: `${role_uuid}/sections`,
        label: "Service Sections",
      },
      {
        path: `${role_uuid}/components`,
        label: "Section Components",
      },
      { path: `${role_uuid}/apis`, label: "Apis" },
    ];


  return (
    <div>
      {/* Render the menu and children */}
      <TabLink
        basePath="/rbac/roles/permissions"
        menuItems={menuItems.map((item) => ({ ...item, title: item.label }))}
        title={"Role Permissions"}
      />
      <div className=" bg-white dark:bg-gray-900 border-t border-slate-500">
        <Suspense fallback={<ContentLoading />}>{children}</Suspense>
      </div>
    </div>
  );
}
