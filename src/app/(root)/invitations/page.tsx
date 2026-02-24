"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Invitations are now part of User Management (/users).
 * Redirect legacy /invitations links to /users.
 */
export default function InvitationsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/users");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[200px] text-slate-600 dark:text-slate-400">
      Redirecting to User Management...
    </div>
  );
}
