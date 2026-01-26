import { createAsyncThunk } from "@reduxjs/toolkit";
import { logout } from "./authSlice";
import { toast } from "react-toastify";
import { resetState } from "../reset";

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
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Something went wrong");
      }

      const data = await response.json();
      toast.success(data.message || "Logged out successfully");

      // Dispatch the resetState action to reset Redux store
      dispatch(resetState());
      // Dispatch the logout action to reset Redux state
      dispatch(logout());
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// Note: refresh and signup are handled via apiClient or future flows.
