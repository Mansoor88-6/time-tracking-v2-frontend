"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

interface AuthGuardProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

export const AuthGuard = ({
  children,
  requireSuperAdmin = false,
}: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      // Decide which login to use based on path / requirement
      if (requireSuperAdmin || pathname.startsWith("/superadmin")) {
        router.replace("/superadmin/login");
      } else {
        router.replace("/auth/login");
      }
      return;
    }

    if (requireSuperAdmin && user?.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, requireSuperAdmin, router, pathname, user]);

  if (!isAuthenticated && (requireSuperAdmin || pathname.startsWith("/superadmin"))) {
    return null;
  }

  if (!isAuthenticated && !pathname.startsWith("/auth")) {
    return null;
  }

  return <>{children}</>;
};
