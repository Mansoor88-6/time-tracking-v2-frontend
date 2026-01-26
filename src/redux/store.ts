import {
  configureStore,
  combineReducers,
  AnyAction,
  Reducer,
} from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./features/auth/authSlice";
import rbacReducer from "./features/rbac/rbacSlice";
import { authApi } from "./services/authApi";
import { resetState } from "./features/reset";

// Combine all reducers
const appReducer = combineReducers({
  auth: authReducer,
  rbac: rbacReducer,
  [authApi.reducerPath]: authApi.reducer,
});

// Define RootState type based on appReducer
export type RootState = ReturnType<typeof appReducer>;

// Root reducer with reset functionality
export const rootReducer: Reducer<RootState, AnyAction> = (state, action) => {
  if (action.type === resetState.type) {
    // Reset the entire Redux state
    state = undefined;
  }
  return appReducer(state, action);
};

// Configure the store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

// Setup RTK Query listeners
setupListeners(store.dispatch);

// Export types
export type AppDispatch = typeof store.dispatch;
