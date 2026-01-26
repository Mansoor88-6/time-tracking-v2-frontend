"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { logoutUser } from "@/redux/features/auth/authThunks";

const LogoutPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await dispatch(logoutUser()).unwrap();
      } finally {
        router.replace("/auth/login");
      }
    };

    void doLogout();
  }, [dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Logging you out...
      </p>
    </div>
  );
};

export default LogoutPage;

