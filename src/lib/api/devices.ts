import { apiClient } from "../apiClient";

export interface Device {
  id: number;
  userId: number;
  tenantId: number;
  deviceId: string;
  name?: string | null;
  isAuthorized: boolean;
  lastSeenAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface RegisterDeviceDto {
  deviceId: string;
  name: string;
}

export const devicesApi = {
  list: async (): Promise<Device[]> => {
    return apiClient<Device[]>("/devices/me");
  },

  register: async (data: RegisterDeviceDto): Promise<Device> => {
    return apiClient<Device>("/devices/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  revoke: async (id: number): Promise<void> => {
    return apiClient<void>(`/devices/${id}/revoke`, {
      method: "PATCH",
    });
  },
};
