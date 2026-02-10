"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { useAuth } from "@/hooks/useAuth";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import type { Role } from "@/types/auth/auth";

interface AuthGuardProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
  requiredRoles?: Role[]; // Roles that can access this route
}

export const AuthGuard = ({
  children,
  requireSuperAdmin = false,
  requiredRoles,
}: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, accessToken } = useAppSelector(
    (state) => state.auth
  );
  // Use useAuth hook to fetch and set user data if we have a token
  const { isLoading: isLoadingAuth, error: authError } = useAuth();
  const { hasAnyRole } = useRoleAccess();

  useEffect(() => {
    // If we have no token and not authenticated, redirect to login
    if (!accessToken && !isAuthenticated) {
      // Decide which login to use based on path / requirement
      if (requireSuperAdmin || pathname.startsWith("/superadmin")) {
        router.replace("/superadmin/login");
      } else {
        router.replace("/auth/login");
      }
      return;
    }

    // If auth query failed (401), redirect to login
    if (authError && "status" in authError && authError.status === 401) {
      if (requireSuperAdmin || pathname.startsWith("/superadmin")) {
        router.replace("/superadmin/login");
      } else {
        router.replace("/auth/login");
      }
      return;
    }

    // Check super admin requirement
    if (requireSuperAdmin && user?.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
      return;
    }

    // Check role-based access if requiredRoles is specified
    if (requiredRoles && requiredRoles.length > 0) {
      if (!hasAnyRole(requiredRoles)) {
        router.replace("/dashboard");
        return;
      }
    }
  }, [
    isAuthenticated,
    accessToken,
    requireSuperAdmin,
    requiredRoles,
    hasAnyRole,
    router,
    pathname,
    user,
    authError,
  ]);

  // Show loading state while checking authentication
  if (accessToken && !user && isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-700 dark:text-slate-300">
          Loading...
        </div>
      </div>
    );
  }

  // Don't render if not authenticated and not on auth pages
  if (!accessToken && !isAuthenticated) {
    if (requireSuperAdmin || pathname.startsWith("/superadmin")) {
      return null;
    }
    if (!pathname.startsWith("/auth")) {
      return null;
    }
  }

  return <>{children}</>;
};
