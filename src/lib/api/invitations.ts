import { apiClient } from "../apiClient";

export interface Invitation {
  id: number;
  email: string;
  role: string;
  tenantId: number;
  teamIds?: number[];
  token: string;
  acceptedAt?: string | null;
  createdAt: string;
  createdBy: number;
}

export interface CreateInvitationDto {
  email: string;
  role: string;
  teamIds?: number[];
}

export interface AcceptInvitationDto {
  name: string;
  password: string;
}

export const invitationsApi = {
  list: async (tenantId: number): Promise<Invitation[]> => {
    // Note: Backend may not have this endpoint yet
    // This is a placeholder for when it's implemented
    return apiClient<Invitation[]>(`/organizations/${tenantId}/invitations`);
  },

  get: async (token: string): Promise<{
    email: string;
    tenantName: string;
    role: string;
  }> => {
    return apiClient<{
      email: string;
      tenantName: string;
      role: string;
    }>(`/invitations/${token}`);
  },

  create: async (
    tenantId: number,
    data: CreateInvitationDto
  ): Promise<Invitation> => {
    return apiClient<Invitation>(`/organizations/${tenantId}/invitations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  accept: async (
    token: string,
    data: AcceptInvitationDto
  ): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/invitations/${token}/accept`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
