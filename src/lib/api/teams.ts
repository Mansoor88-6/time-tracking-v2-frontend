import { apiClient } from "../apiClient";

export interface Team {
  id: number;
  name: string;
  managerId?: number | null;
  managerName?: string;
  tenantId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeamDto {
  name: string;
  managerId?: number;
}

export interface UpdateTeamDto {
  name?: string;
  managerId?: number | null;
}

export const teamsApi = {
  list: async (): Promise<Team[]> => {
    return apiClient<Team[]>("/teams");
  },

  get: async (id: number): Promise<Team> => {
    return apiClient<Team>(`/teams/${id}`);
  },

  create: async (data: CreateTeamDto): Promise<Team> => {
    return apiClient<Team>("/teams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateTeamDto): Promise<Team> => {
    return apiClient<Team>(`/teams/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiClient<void>(`/teams/${id}`, {
      method: "DELETE",
    });
  },
};
