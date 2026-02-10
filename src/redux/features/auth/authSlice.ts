import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loginUser, logoutUser } from "./authThunks";
import { User } from "@/types/auth/auth";
import { resetState } from "../reset";
import { setTokens as setTokensCookie, clearTokens } from "@/lib/cookies";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setTokens(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>
    ) {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      // If we have an access token, consider user authenticated (temporary until user data loads)
      // This prevents redirect to login when tokens are restored from cookies
      if (action.payload.accessToken) {
        state.isAuthenticated = true;
      }
      // Sync with cookies (only if we're in browser and tokens are not empty)
      if (typeof window !== "undefined" && action.payload.accessToken) {
        setTokensCookie(
          action.payload.accessToken,
          action.payload.refreshToken
        );
      }
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      // Clear cookies
      clearTokens();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        // Sync with cookies
        setTokensCookie(
          action.payload.accessToken,
          action.payload.refreshToken
        );
      })
      .addCase(logoutUser.fulfilled, () => {
        clearTokens();
        return initialAuthState;
      })
      .addCase(resetState, () => {
        clearTokens();
        return initialAuthState;
      });
  },
});

export const { setUser, setTokens, logout } = authSlice.actions;
export default authSlice.reducer;
