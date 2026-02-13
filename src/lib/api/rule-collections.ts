import { apiClient } from "../apiClient";
import { AppType, AppCategory } from "./productivity-rules";
import { TeamProductivityRule, productivityRulesApi } from "./productivity-rules";

export interface RuleCollection {
  id: number;
  name: string;
  description?: string | null;
  tenantId: number;
  createdBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
  teamAssignments?: Array<{
    id: number;
    teamId: number;
    team: {
      id: number;
      name: string;
    };
  }>;
  creator?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface SuggestedApp {
  appName: string;
  appType: AppType;
  suggestedCategory: AppCategory;
}

export interface SuggestedAppsResponse {
  desktop: SuggestedApp[];
  web: SuggestedApp[];
}

export enum RuleType {
  APP_NAME = 'app_name',
  DOMAIN = 'domain',
  URL_EXACT = 'url_exact',
  URL_PATTERN = 'url_pattern',
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
  teamIds: number[];
  rules: Array<{
    appName: string;
    appType: AppType;
    category: AppCategory;
    ruleType?: RuleType;
    pattern?: string;
  }>;
}

export interface UpdateCollectionDto {
  name?: string;
  description?: string;
  teamIds?: number[]; // For updating team assignments
}

export interface AddRulesToCollectionDto {
  rules: Array<{
    appName: string;
    appType: AppType;
    category: AppCategory;
    ruleType?: RuleType;
    pattern?: string;
  }>;
}

export interface AssignCollectionToTeamsDto {
  teamIds: number[];
}

export const ruleCollectionsApi = {
  getSuggestions: async (): Promise<SuggestedAppsResponse> => {
    return apiClient<SuggestedAppsResponse>("/rule-collections/suggestions");
  },

  create: async (data: CreateCollectionDto): Promise<RuleCollection> => {
    return apiClient<RuleCollection>("/rule-collections", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  list: async (filters?: { teamId?: number }): Promise<RuleCollection[]> => {
    const params = new URLSearchParams();
    if (filters?.teamId) params.append("teamId", filters.teamId.toString());
    const query = params.toString();
    return apiClient<RuleCollection[]>(
      `/rule-collections${query ? `?${query}` : ""}`
    );
  },

  get: async (id: number): Promise<RuleCollection> => {
    return apiClient<RuleCollection>(`/rule-collections/${id}`);
  },

  getCollectionRules: async (collectionId: number): Promise<TeamProductivityRule[]> => {
    try {
      // Try the direct endpoint first (if it exists)
      return await apiClient<TeamProductivityRule[]>(`/rule-collections/${collectionId}/rules`);
    } catch (err) {
      // Fallback: Get collection to find assigned teams, then get rules from those teams and filter by collectionId
      const collection = await ruleCollectionsApi.get(collectionId);
      const teamIds = collection.teamAssignments?.map((ta) => ta.teamId) || [];
      
      if (teamIds.length === 0) {
        return [];
      }

      // Fetch rules from all assigned teams and filter by collectionId
      const allRules: TeamProductivityRule[] = [];
      for (const teamId of teamIds) {
        try {
          const teamRules = await productivityRulesApi.getTeamRules(teamId);
          allRules.push(...teamRules);
        } catch (err) {
          console.error(`Failed to load rules for team ${teamId}:`, err);
        }
      }

      // Filter rules that belong to this collection
      return allRules.filter((rule) => rule.collectionId === collectionId);
    }
  },

  update: async (
    id: number,
    data: UpdateCollectionDto
  ): Promise<RuleCollection> => {
    return apiClient<RuleCollection>(`/rule-collections/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiClient<void>(`/rule-collections/${id}`, {
      method: "DELETE",
    });
  },

  addRules: async (
    id: number,
    data: AddRulesToCollectionDto
  ): Promise<any[]> => {
    return apiClient<any[]>(`/rule-collections/${id}/rules`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  removeRule: async (ruleId: number): Promise<void> => {
    return apiClient<void>(`/rule-collections/rules/${ruleId}`, {
      method: "DELETE",
    });
  },

  assignToTeams: async (
    id: number,
    data: AssignCollectionToTeamsDto
  ): Promise<any[]> => {
    return apiClient<any[]>(`/rule-collections/${id}/teams`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  unassignFromTeam: async (
    id: number,
    teamId: number
  ): Promise<void> => {
    return apiClient<void>(`/rule-collections/${id}/teams/${teamId}`, {
      method: "DELETE",
    });
  },
};
