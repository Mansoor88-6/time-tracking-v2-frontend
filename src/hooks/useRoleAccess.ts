// hooks/useRoleAccess.ts
// React hook for role-based access control

import { useMemo } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  canAccessRoute,
  getAllowedRoutes,
  hasMinimumRole,
  getRoleDisplayName,
  type Role,
} from "@/utils/rbac";

export const useRoleAccess = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userRole = user?.role as Role | null | undefined;

  const roleHelpers = useMemo(
    () => ({
      // User role info
      role: userRole,
      roleDisplayName: getRoleDisplayName(userRole),
      isSuperAdmin: userRole === "SUPER_ADMIN",
      isOrgAdmin: userRole === "ORG_ADMIN",
      isTeamManager: userRole === "TEAM_MANAGER",
      isEmployee: userRole === "EMPLOYEE",
      isViewer: userRole === "VIEWER",

      // Role checking functions
      hasRole: (requiredRole: Role) => hasRole(userRole, requiredRole),
      hasAnyRole: (requiredRoles: Role[]) => hasAnyRole(userRole, requiredRoles),
      hasAllRoles: (requiredRoles: Role[]) => hasAllRoles(userRole, requiredRoles),
      hasMinimumRole: (minimumRole: Role) => hasMinimumRole(userRole, minimumRole),

      // Route access
      canAccessRoute: (route: string) => canAccessRoute(userRole, route),
      getAllowedRoutes: () => getAllowedRoutes(userRole),
    }),
    [userRole]
  );

  return roleHelpers;
};
