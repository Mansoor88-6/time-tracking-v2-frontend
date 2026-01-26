import { apiClient } from "../apiClient";

export interface Session {
  id: number;
  userId: number;
  tenantId?: number | null;
  deviceId?: string | null;
  deviceName?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  clientType: string;
  lastSeenAt?: string | null;
  createdAt: string;
  expiresAt?: string | null;
}

export const sessionsApi = {
  getMySessions: async (): Promise<Session[]> => {
    return apiClient<Session[]>("/sessions/me");
  },

  getOrganizationSessions: async (): Promise<Session[]> => {
    return apiClient<Session[]>("/sessions/organization");
  },

  revoke: async (id: number): Promise<void> => {
    return apiClient<void>(`/sessions/${id}`, {
      method: "DELETE",
    });
  },
};
