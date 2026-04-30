"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { ColleaguesSection } from "@/components/ui/ColleaguesSection/ColleaguesSection";
import { fetchColleagues } from "@/services/colleagues";
import { useQuery } from "@tanstack/react-query";

const COLLEAGUES_ONLINE_WINDOW_SEC = 120;

export default function ColleaguesPage() {
  const {
    data: colleaguesResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["colleagues", COLLEAGUES_ONLINE_WINDOW_SEC],
    queryFn: () => fetchColleagues(COLLEAGUES_ONLINE_WINDOW_SEC),
    refetchInterval: 45_000,
    staleTime: 20_000,
  });

  return (
    <AuthGuard>
      <div className="space-y-6">
        <PageHeader
          title="Colleagues"
          description="People in your organization, teams, and who is active based on recent tracking events."
        />
        <ColleaguesSection
          showHeading={false}
          windowSec={
            colleaguesResponse?.windowSec ?? COLLEAGUES_ONLINE_WINDOW_SEC
          }
          colleagues={colleaguesResponse?.colleagues ?? []}
          isLoading={isLoading}
          errorMessage={
            isError
              ? error instanceof Error
                ? error.message
                : "Failed to load colleagues"
              : null
          }
        />
      </div>
    </AuthGuard>
  );
}
