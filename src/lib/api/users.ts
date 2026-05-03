import { apiClient } from "../apiClient";

export type WageCurrency = "PKR" | "USD";

export interface User {
  id: number;
  email: string;
  name?: string | null;
  displayName?: string | null;
  role: string;
  tenantId: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  teams?: { id: number; name: string }[];
  dailyWorkingHours?: number | null;
  monthlyWage?: number | null;
  wageCurrency?: WageCurrency | null;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
  dailyWorkingHours?: number;
  monthlyWage?: number;
  wageCurrency?: WageCurrency;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  displayName?: string;
  password?: string;
  isActive?: boolean;
  dailyWorkingHours?: number | null;
  monthlyWage?: number | null;
  wageCurrency?: WageCurrency | null;
}

export interface UpdateUserRoleDto {
  role: string;
}

export const usersApi = {
  list: async (): Promise<User[]> => {
    return apiClient<User[]>("/users");
  },

  get: async (id: number): Promise<User> => {
    return apiClient<User>(`/users/${id}`);
  },

  getMe: async (): Promise<User> => {
    return apiClient<User>("/users/me");
  },

  create: async (data: CreateUserDto): Promise<User> => {
    return apiClient<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    return apiClient<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  updateRole: async (id: number, data: UpdateUserRoleDto): Promise<User> => {
    return apiClient<User>(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiClient<void>(`/users/${id}`, {
      method: "DELETE",
    });
  },
};
