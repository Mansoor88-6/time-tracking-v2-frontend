"use client";
import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import RbacRolesPermissionsLayout from "../_layouts/PermissionsLayout";
import RbacRolesLayout from "../_layouts/RolesLayout";

export default function RbacBaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Use useMemo to memoize the layout selection
  const Layout = useMemo(() => {
    return pathname.includes("/permissions")
      ? RbacRolesPermissionsLayout
      : RbacRolesLayout;
  }, [pathname]);

  return (
    <div>
      {/* Use the selected layout for rendering children */}
      <Layout>{children}</Layout>
    </div>
  );
}
