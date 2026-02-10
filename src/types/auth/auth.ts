// Role interface
export interface Role {
  roleId: number;
  roleUuid: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// UserRole interface
export interface UserRole {
  userRoleId: number;
  createdAt: string;
  updatedAt: string;
  role: Role;
}

// Permissions interface
export interface Permissions {
  can_read: boolean;
  can_write: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_publish: boolean;
}

// Component interface
export interface Component {
  component_name: string;
  permissions: Permissions;
}

// Section interface
export interface Section {
  section_name: string;
  components: Component[];
}

// RolePermission interface
export interface RolePermission {
  service_name: string;
  service_sections: Section[];
}

// Role enum matching backend
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ORG_ADMIN = "ORG_ADMIN",
  TEAM_MANAGER = "TEAM_MANAGER",
  EMPLOYEE = "EMPLOYEE",
  VIEWER = "VIEWER",
}

// Role type for type safety
export type Role = UserRole | string;

// Simplified auth user interface aligned with backend JWT payload
export interface User {
  id: number;
  email: string;
  name: string;
  tenantId?: number;
  role: string;
  type: "user" | "superadmin";
}

// AuthResponse interface aligned with backend login response
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
