import { User } from "@/types/auth/auth";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { getAccessToken } from "@/lib/cookies";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include", // Important for sending cookies
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux state
      const state = getState() as RootState;
      let token = state.auth.accessToken;

      // If no token in Redux, try to get from cookies
      if (!token && typeof window !== "undefined") {
        token = getAccessToken();
      }

      // Add Authorization header if token exists
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    // /auth/me returns user object directly, not AuthResponse
    getMe: builder.query<User, void>({
      query: () => `/auth/me`, // The NestJS endpoint
      keepUnusedDataFor: 3600,
    }),
  }),
});

// Export the auto-generated hook
export const { useGetMeQuery } = authApi;
