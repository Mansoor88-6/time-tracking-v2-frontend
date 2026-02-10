// components/RouteGuard.tsx
// Component for protecting routes based on user roles

"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import type { Role } from "@/types/auth/auth";

interface RouteGuardProps {
  children: ReactNode;
  requiredRoles?: Role[];
  fallbackRoute?: string;
  showAccessDenied?: boolean;
}

export const RouteGuard = ({
  children,
  requiredRoles,
  fallbackRoute = "/dashboard",
  showAccessDenied = false,
}: RouteGuardProps) => {
  const router = useRouter();
  const { hasAnyRole, role } = useRoleAccess();

  useEffect(() => {
    // If no required roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return;
    }

    // Check if user has required role
    if (!hasAnyRole(requiredRoles)) {
      if (showAccessDenied) {
        // Could show an access denied message here
        // For now, just redirect
      }
      router.replace(fallbackRoute);
    }
  }, [requiredRoles, hasAnyRole, router, fallbackRoute, showAccessDenied]);

  // If no required roles, render children
  if (!requiredRoles || requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // If user doesn't have required role, don't render children
  if (!hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
