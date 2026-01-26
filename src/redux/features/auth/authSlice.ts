import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loginUser, logoutUser } from "./authThunks";
import { User } from "@/types/auth/auth";
import { resetState } from "../reset";

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
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(logoutUser.fulfilled, () => initialAuthState)
      .addCase(resetState, () => initialAuthState);
  },
});

export const { setUser, setTokens, logout } = authSlice.actions;
export default authSlice.reducer;
