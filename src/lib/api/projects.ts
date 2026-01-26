import { apiClient } from "../apiClient";

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  teamId?: number | null;
  tenantId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  teamId?: number;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  teamId?: number | null;
}

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    return apiClient<Project[]>("/projects");
  },

  get: async (id: number): Promise<Project> => {
    return apiClient<Project>(`/projects/${id}`);
  },

  create: async (data: CreateProjectDto): Promise<Project> => {
    return apiClient<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateProjectDto): Promise<Project> => {
    return apiClient<Project>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiClient<void>(`/projects/${id}`, {
      method: "DELETE",
    });
  },
};
