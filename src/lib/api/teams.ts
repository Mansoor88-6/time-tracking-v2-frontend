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

export interface TeamMember {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  teamRole?: string | null;
  createdAt?: string;
}

export interface TeamWithMembers extends Team {
  members?: TeamMember[];
}

export interface CreateTeamDto {
  name: string;
  managerId?: number;
}

export interface UpdateTeamDto {
  name?: string;
  managerId?: number | null;
}

export interface AddTeamMemberDto {
  userId: number;
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

  getTeamMembers: async (id: number): Promise<TeamMember[]> => {
    return apiClient<TeamMember[]>(`/teams/${id}/members`);
  },

  addTeamMember: async (teamId: number, userId: number): Promise<TeamMember> => {
    return apiClient<TeamMember>(`/teams/${teamId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  removeTeamMember: async (teamId: number, userId: number): Promise<void> => {
    return apiClient<void>(`/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
    });
  },

  getTeamCollections: async (id: number): Promise<any[]> => {
    return apiClient<any[]>(`/teams/${id}/collections`);
  },
};
