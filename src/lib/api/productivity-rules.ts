import { apiClient } from "../apiClient";

export type AppType = "desktop" | "web";
export type AppCategory = "productive" | "unproductive" | "neutral";
export type UnclassifiedAppStatus = "pending" | "reviewed" | "classified";

export interface TeamProductivityRule {
  id: number;
  teamId: number;
  collectionId?: number | null;
  appName: string;
  appType: AppType;
  category: AppCategory;
  ruleType?: string; // RuleType enum value
  pattern?: string | null;
  createdAt?: string;
  updatedAt?: string;
  collection?: {
    id: number;
    name: string;
  } | null;
}

export interface UnclassifiedApp {
  id: number;
  tenantId: number;
  teamId?: number | null;
  appName: string;
  appType: AppType;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  status: UnclassifiedAppStatus;
  createdAt?: string;
  updatedAt?: string;
  team?: {
    id: number;
    name: string;
  } | null;
}

export interface CreateRuleDto {
  teamId: number;
  appName: string;
  appType: AppType;
  category: AppCategory;
}

export interface UpdateRuleDto {
  category: AppCategory;
}

export interface BulkCreateRulesDto {
  rules: CreateRuleDto[];
}

export interface ClassifyUnclassifiedDto {
  appName: string;
  appType: AppType;
  category: AppCategory;
  applyToTeamId?: number;
}

export const productivityRulesApi = {
  create: async (data: CreateRuleDto): Promise<TeamProductivityRule> => {
    return apiClient<TeamProductivityRule>("/productivity-rules", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  bulkCreate: async (data: BulkCreateRulesDto): Promise<TeamProductivityRule[]> => {
    return apiClient<TeamProductivityRule[]>("/productivity-rules/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getTeamRules: async (teamId: number): Promise<TeamProductivityRule[]> => {
    return apiClient<TeamProductivityRule[]>(`/productivity-rules/teams/${teamId}`);
  },

  update: async (id: number, data: UpdateRuleDto): Promise<TeamProductivityRule> => {
    return apiClient<TeamProductivityRule>(`/productivity-rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiClient<void>(`/productivity-rules/${id}`, {
      method: "DELETE",
    });
  },

  getUnclassified: async (filters?: {
    teamId?: number;
    appType?: AppType;
    status?: UnclassifiedAppStatus;
  }): Promise<UnclassifiedApp[]> => {
    const params = new URLSearchParams();
    if (filters?.teamId) params.append("teamId", filters.teamId.toString());
    if (filters?.appType) params.append("appType", filters.appType);
    if (filters?.status) params.append("status", filters.status);

    const query = params.toString();
    return apiClient<UnclassifiedApp[]>(
      `/productivity-rules/unclassified${query ? `?${query}` : ""}`
    );
  },

  classifyUnclassified: async (
    data: ClassifyUnclassifiedDto
  ): Promise<{ rule: TeamProductivityRule; unclassified: UnclassifiedApp }> => {
    return apiClient<{ rule: TeamProductivityRule; unclassified: UnclassifiedApp }>(
      "/productivity-rules/unclassified/classify",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
};
