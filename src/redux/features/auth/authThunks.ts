import { createAsyncThunk } from "@reduxjs/toolkit";
import { logout } from "./authSlice";
import { toast } from "react-toastify";
import { resetState } from "../reset";
import { clearTokens, getAccessToken } from "@/lib/cookies";
import type { RootState } from "@/redux/store";

const BASE_URL = "http://localhost:4000";

// Login Thunk
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string; userType: "user" | "superadmin" },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include", // Include cookies to receive httpOnly refresh token
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Something went wrong");
      }

      const data = await response.json();
      toast.success("Logged in successfully");
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// Logout Thunk
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      // Get token from Redux state or cookies
      const state = getState() as RootState;
      let accessToken = state.auth.accessToken;
      if (!accessToken && typeof window !== "undefined") {
        accessToken = getAccessToken();
      }

      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Include cookies so backend can clear httpOnly refresh token
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Even if backend logout fails, clear local state and cookies
        clearTokens();
        dispatch(resetState());
        dispatch(logout());
        return rejectWithValue(errorData.message || "Something went wrong");
      }

      const data = await response.json();
      toast.success(data.message || "Logged out successfully");

      // Dispatch the resetState action to reset Redux store
      dispatch(resetState());
      // Dispatch the logout action to reset Redux state
      dispatch(logout());
      // Cookies are cleared by the logout action, but ensure they're cleared here too
      clearTokens();
      return data;
    } catch (error: unknown) {
      // Even if network error occurs, clear local state and cookies
      clearTokens();
      dispatch(resetState());
      dispatch(logout());
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// Note: refresh and signup are handled via apiClient or future flows.
