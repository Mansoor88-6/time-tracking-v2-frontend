"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/redux/services/authApi";

/**
 * `/` must live outside `(root)` so guests never see the dashboard shell (sidebar/header)
 * before redirecting to `/home`. Previously `(root)/page.tsx` inherited CustomLayout.
 */
export default function RootPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetMeQuery();

  useEffect(() => {
    if (isLoading) return;

    if (data && !isError) {
      router.replace("/dashboard");
    } else {
      router.replace("/home");
    }
  }, [data, isError, isLoading, router]);

  return null;
}
