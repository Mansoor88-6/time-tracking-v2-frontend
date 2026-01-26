import { apiClient } from "../apiClient";

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
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  displayName?: string;
  password?: string;
  isActive?: boolean;
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
