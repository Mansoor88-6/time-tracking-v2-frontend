// utils/rbac.ts
// Role-based access control utilities

import { UserRole, type Role } from "@/types/auth/auth";

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY: Record<string, number> = {
  [UserRole.VIEWER]: 1,
  [UserRole.EMPLOYEE]: 2,
  [UserRole.TEAM_MANAGER]: 3,
  [UserRole.ORG_ADMIN]: 4,
  [UserRole.SUPER_ADMIN]: 5,
};

// Route access requirements
export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  "/dashboard": [
    UserRole.SUPER_ADMIN,
    UserRole.ORG_ADMIN,
    UserRole.TEAM_MANAGER,
    UserRole.EMPLOYEE,
    UserRole.VIEWER,
  ],
  "/teams": [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_MANAGER],
  "/projects": [
    UserRole.SUPER_ADMIN,
    UserRole.ORG_ADMIN,
    UserRole.TEAM_MANAGER,
    UserRole.EMPLOYEE,
    UserRole.VIEWER,
  ],
  "/sessions": [
    UserRole.SUPER_ADMIN,
    UserRole.ORG_ADMIN,
    UserRole.TEAM_MANAGER,
    UserRole.EMPLOYEE,
    UserRole.VIEWER,
  ],
  "/devices": [
    UserRole.SUPER_ADMIN,
    UserRole.ORG_ADMIN,
    UserRole.TEAM_MANAGER,
    UserRole.EMPLOYEE,
    UserRole.VIEWER,
  ],
  "/users": [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN],
  "/invitations": [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN],
};

/**
 * Check if a user has a specific role
 */
export function hasRole(userRole: Role | null | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;
  if (userRole === UserRole.SUPER_ADMIN) return true; // SuperAdmin has all roles
  return userRole === requiredRole;
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(
  userRole: Role | null | undefined,
  requiredRoles: Role[]
): boolean {
  if (!userRole) return false;
  if (userRole === UserRole.SUPER_ADMIN) return true; // SuperAdmin has all roles
  return requiredRoles.includes(userRole);
}

/**
 * Check if a user has all of the specified roles (useful for future multi-role support)
 */
export function hasAllRoles(
  userRole: Role | null | undefined,
  requiredRoles: Role[]
): boolean {
  if (!userRole) return false;
  if (userRole === UserRole.SUPER_ADMIN) return true;
  return requiredRoles.every((role) => userRole === role);
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(
  userRole: Role | null | undefined,
  route: string
): boolean {
  if (!userRole) return false;
  if (userRole === UserRole.SUPER_ADMIN) return true; // SuperAdmin can access all routes

  const allowedRoles = ROUTE_PERMISSIONS[route];
  if (!allowedRoles) return true; // If route not in permissions, allow access (backward compatibility)

  return hasAnyRole(userRole, allowedRoles);
}

/**
 * Get all routes accessible by a specific role
 */
export function getAllowedRoutes(userRole: Role | null | undefined): string[] {
  if (!userRole) return [];
  if (userRole === UserRole.SUPER_ADMIN) {
    return Object.keys(ROUTE_PERMISSIONS);
  }

  return Object.entries(ROUTE_PERMISSIONS)
    .filter(([_, allowedRoles]) => hasAnyRole(userRole, allowedRoles))
    .map(([route]) => route);
}

/**
 * Check if user role has minimum required level
 */
export function hasMinimumRole(
  userRole: Role | null | undefined,
  minimumRole: Role
): boolean {
  if (!userRole) return false;
  if (userRole === UserRole.SUPER_ADMIN) return true;

  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const minimumLevel = ROLE_HIERARCHY[minimumRole] || 0;

  return userLevel >= minimumLevel;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role | null | undefined): string {
  if (!role) return "Unknown";

  const displayNames: Record<string, string> = {
    [UserRole.SUPER_ADMIN]: "Super Admin",
    [UserRole.ORG_ADMIN]: "Organization Admin",
    [UserRole.TEAM_MANAGER]: "Team Manager",
    [UserRole.EMPLOYEE]: "Employee",
    [UserRole.VIEWER]: "Viewer",
  };

  return displayNames[role] || role;
}
