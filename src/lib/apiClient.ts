// services/apiClient.ts
import { store } from "@/redux/store";
import { logout, setTokens } from "@/redux/features/auth/authSlice";

const BASE_URL = "http://localhost:4000";

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Function to refresh the access token
const refreshToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const state = store.getState();
      const refreshTokenValue = state.auth.refreshToken;

      if (!refreshTokenValue) {
        store.dispatch(logout());
        return false;
      }

      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        store.dispatch(logout());
        return false;
      }

      const data = (await response.json()) as { accessToken: string };
      store.dispatch(
        setTokens({ accessToken: data.accessToken, refreshToken: refreshTokenValue })
      );
      return true;
    } catch {
      // Network error or other issues, dispatch logout action
      store.dispatch(logout());
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const apiClient = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const makeRequest = async (): Promise<Response> => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    return fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
      },
    });
  };

  let response = await makeRequest();

  // If we get a 401 (Unauthorized), try to refresh the token
  if (response.status === 401) {
    const refreshSuccess = await refreshToken();

    if (refreshSuccess) {
      // Retry the original request with the new token
      response = await makeRequest();
    } else {
      // Refresh failed, throw an error that can be handled by the calling code
      throw new Error("Authentication failed. Please login again.");
    }
  }

  if (!response.ok) {
    // Handle different error scenarios
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // If we can't parse the error response, use the default message
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
};

// Utility function to check if an error is an authentication error
export const isAuthError = (error: Error): boolean => {
  return (
    error.message.includes("Authentication failed") ||
    error.message.includes("401") ||
    error.message.includes("Unauthorized")
  );
};

// Utility function to create API client with custom error handling
export const createApiClient = (
  customErrorHandler?: (error: Error) => void
) => {
  return async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    try {
      return await apiClient<T>(url, options);
    } catch (error) {
      if (error instanceof Error && customErrorHandler) {
        customErrorHandler(error);
      }
      throw error;
    }
  };
};
