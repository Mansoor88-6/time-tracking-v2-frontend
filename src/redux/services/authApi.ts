import { AuthResponse } from "@/types/auth/auth";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include", // Important for sending cookies
  }),
  endpoints: (builder) => ({
    getMe: builder.query<AuthResponse, void>({
      query: () => `/auth/me`, // The NestJS endpoint
      keepUnusedDataFor: 3600,
    }),
  }),
});

// Export the auto-generated hook
export const { useGetMeQuery } = authApi;
