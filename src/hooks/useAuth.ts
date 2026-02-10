// hooks/useAuth.ts
"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "@/redux/services/authApi";
import { setUser } from "@/redux/features/auth/authSlice";
import { setPermissions } from "@/redux/features/rbac/rbacSlice";
import type { User } from "@/types/auth/auth";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { data, error, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (data) {
      // Handle different response structures
      // /auth/me returns user object directly: { id, email, name, tenantId, role, type }
      // Some endpoints might return nested: { user: { user: {...}, rolePermissions: [...] } }
      if ("user" in data && typeof data.user === "object" && data.user !== null) {
        // Nested structure (if it exists)
        if ("user" in data.user && "rolePermissions" in data.user) {
          dispatch(setUser((data.user as any).user));
          dispatch(setPermissions((data.user as any).rolePermissions || []));
        } else {
          // Direct user object in user property
          dispatch(setUser(data.user as User));
          dispatch(setPermissions([]));
        }
      } else {
        // Direct user object (from /auth/me)
        dispatch(setUser(data as User));
        dispatch(setPermissions([]));
      }
    }
  }, [data, dispatch]);
  console.log(`from useAuth hook: ${JSON.stringify(data)}`);
  return { isLoading, error };
};
