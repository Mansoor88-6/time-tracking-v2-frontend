"use client";
import React, { Suspense } from "react";
import TabLink from "@/components/ui/Tab/TabLink";
import ContentLoading from "@/components/ui/Loading/ContentLoading";

export default function RbacRolesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menuItems = [
    { path: "roles", label: "Roles" },
    { path: "user-roles", label: "User Roles" },
  ];

  return (
    <div>
      {/* Render the menu and children */}
      <TabLink
        basePath="/rbac"
        menuItems={menuItems.map((item) => ({ ...item, title: item.label }))}
        title={"Role Base Access Control"}
      />
      <div className=" bg-white dark:bg-gray-900 border-t border-slate-500">
        <Suspense fallback={<ContentLoading />}>{children}</Suspense>
      </div>
    </div>
  );
}
