import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { getAccessToken } from "@/lib/cookies";
import {
  RuleCollection,
  CreateCollectionDto,
  UpdateCollectionDto,
  AddRulesToCollectionDto,
  AssignCollectionToTeamsDto,
} from "@/lib/api/rule-collections";
import { TeamProductivityRule } from "@/lib/api/productivity-rules";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const ruleCollectionsApi = createApi({
  reducerPath: "ruleCollectionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      let token = state.auth.accessToken;

      if (!token && typeof window !== "undefined") {
        token = getAccessToken();
      }

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Collection", "CollectionRules"],
  endpoints: (builder) => ({
    // Query: List all collections
    listCollections: builder.query<RuleCollection[], { teamId?: number } | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.teamId) {
          params.append("teamId", filters.teamId.toString());
        }
        const query = params.toString();
        return `/rule-collections${query ? `?${query}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Collection" as const, id })),
              { type: "Collection", id: "LIST" },
            ]
          : [{ type: "Collection", id: "LIST" }],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    // Query: Get single collection
    getCollection: builder.query<RuleCollection, number>({
      query: (id) => `/rule-collections/${id}`,
      providesTags: (result, error, id) => [{ type: "Collection", id }],
      keepUnusedDataFor: 300,
    }),

    // Query: Get rules for a collection
    getCollectionRules: builder.query<TeamProductivityRule[], number>({
      query: (collectionId) => `/rule-collections/${collectionId}/rules`,
      providesTags: (result, error, collectionId) => [
        { type: "CollectionRules", id: collectionId },
      ],
      keepUnusedDataFor: 300,
    }),

    // Mutation: Create collection
    createCollection: builder.mutation<RuleCollection, CreateCollectionDto>({
      query: (data) => ({
        url: "/rule-collections",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Collection", id: "LIST" }],
    }),

    // Mutation: Update collection
    updateCollection: builder.mutation<
      RuleCollection,
      { id: number; data: UpdateCollectionDto }
    >({
      query: ({ id, data }) => ({
        url: `/rule-collections/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Collection", id },
        { type: "Collection", id: "LIST" },
      ],
    }),

    // Mutation: Delete collection
    deleteCollection: builder.mutation<void, number>({
      query: (id) => ({
        url: `/rule-collections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Collection", id },
        { type: "Collection", id: "LIST" },
      ],
    }),

    // Mutation: Add rules to collection
    addRulesToCollection: builder.mutation<
      TeamProductivityRule[],
      { id: number; data: AddRulesToCollectionDto }
    >({
      query: ({ id, data }) => ({
        url: `/rule-collections/${id}/rules`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "CollectionRules", id },
        { type: "Collection", id },
      ],
    }),

    // Mutation: Remove rule from collection
    removeRuleFromCollection: builder.mutation<void, number>({
      query: (ruleId) => ({
        url: `/rule-collections/rules/${ruleId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, ruleId, meta) => {
        // We need to invalidate based on collectionId, but we only have ruleId
        // So we invalidate all collection rules caches
        return [{ type: "CollectionRules" as const, id: "LIST" }];
      },
    }),

    // Mutation: Assign collection to teams
    assignCollectionToTeams: builder.mutation<
      any[],
      { id: number; data: AssignCollectionToTeamsDto }
    >({
      query: ({ id, data }) => ({
        url: `/rule-collections/${id}/teams`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Collection", id },
        { type: "Collection", id: "LIST" },
      ],
    }),

    // Mutation: Unassign collection from team
    unassignCollectionFromTeam: builder.mutation<
      void,
      { id: number; teamId: number }
    >({
      query: ({ id, teamId }) => ({
        url: `/rule-collections/${id}/teams/${teamId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Collection", id },
        { type: "Collection", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks
export const {
  useListCollectionsQuery,
  useGetCollectionQuery,
  useGetCollectionRulesQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useAddRulesToCollectionMutation,
  useRemoveRuleFromCollectionMutation,
  useAssignCollectionToTeamsMutation,
  useUnassignCollectionFromTeamMutation,
} = ruleCollectionsApi;
