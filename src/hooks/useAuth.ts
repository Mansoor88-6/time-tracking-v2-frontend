// hooks/useAuth.ts
"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "@/redux/services/authApi";
import { setUser } from "@/redux/features/auth/authSlice";
import { setPermissions } from "@/redux/features/rbac/rbacSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { data, error, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (data) {
      dispatch(setUser(data.user.user));
      dispatch(setPermissions(data.user.rolePermissions));
    }
  }, [data, dispatch]);
  console.log(`from useAuth hook: ${JSON.stringify(data)}`);
  return { isLoading, error };
};
