"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  approveOfflineTimeRequest,
  declineOfflineTimeRequest,
  listPendingOfflineTimeRequests,
  type OfflineTimeRequestDto,
} from "@/services/offlineTimeRequests";
import { usersApi, type User } from "@/lib/api/users";

function formatRange(r: OfflineTimeRequestDto): string {
  const a = new Date(r.startAt);
  const b = new Date(r.endAt);
  return `${a.toLocaleString()} → ${b.toLocaleString()}`;
}

function durationMs(r: OfflineTimeRequestDto): number {
  return Math.max(
    0,
    new Date(r.endAt).getTime() - new Date(r.startAt).getTime()
  );
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "0 min";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  if (h > 0) return `${h}h ${min}m`;
  return `${min} min`;
}

type DurationSort = "none" | "asc" | "desc";

export default function OfflineTimeRequestsPage() {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<User[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [durationSort, setDurationSort] = useState<DurationSort>("none");

  useEffect(() => {
    void usersApi
      .list()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const userNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const u of users) {
      m.set(u.id, u.name || u.email);
    }
    return m;
  }, [users]);

  const { data: pending, isLoading, error } = useQuery({
    queryKey: ["offline-time-requests", "pending"],
    queryFn: listPendingOfflineTimeRequests,
  });

  const sortedPending = useMemo(() => {
    if (!pending?.length) return pending ?? [];
    if (durationSort === "none") return pending;
    const copy = [...pending];
    copy.sort((a, b) => {
      const da = durationMs(a);
      const db = durationMs(b);
      return durationSort === "asc" ? da - db : db - da;
    });
    return copy;
  }, [pending, durationSort]);

  const cycleDurationSort = useCallback(() => {
    setDurationSort((s) =>
      s === "none" ? "asc" : s === "asc" ? "desc" : "none"
    );
  }, []);

  const onApprove = useCallback(
    async (id: number) => {
      setBusyId(id);
      try {
        await approveOfflineTimeRequest(id);
        toast.success("Request approved. Time was applied to reports.");
        await queryClient.invalidateQueries({
          queryKey: ["offline-time-requests"],
        });
        await queryClient.invalidateQueries({ queryKey: ["timeline"] });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Approve failed");
      } finally {
        setBusyId(null);
      }
    },
    [queryClient]
  );

  const onDecline = useCallback(
    async (id: number) => {
      const reason = window.prompt("Decline reason (optional):") ?? "";
      setBusyId(id);
      try {
        await declineOfflineTimeRequest(id, reason || undefined);
        toast.success("Request declined.");
        await queryClient.invalidateQueries({
          queryKey: ["offline-time-requests"],
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Decline failed");
      } finally {
        setBusyId(null);
      }
    },
    [queryClient]
  );

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <PageHeader
          title="Offline time requests"
          description="Review requests from team members who want idle or untracked time reclassified. Approving inserts the time into productivity reports."
        />

        {isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : "Failed to load"}
          </p>
        ) : !pending?.length ? (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No pending requests.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Time range
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    <button
                      type="button"
                      onClick={cycleDurationSort}
                      className="inline-flex items-center gap-1.5 rounded-md font-medium text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 -mx-1 px-1 py-0.5 transition-colors"
                      title="Sort by duration: shortest first, longest first, or server order"
                    >
                      Duration
                      <span className="tabular-nums text-xs font-normal text-slate-500">
                        {durationSort === "none"
                          ? "↕"
                          : durationSort === "asc"
                            ? "↑"
                            : "↓"}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPending.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-900">
                      {userNameById.get(r.userId) ?? `User #${r.userId}`}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-600">
                      {formatRange(r)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-800">
                      {formatDuration(durationMs(r))}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-800">
                      {r.category}
                    </td>
                    <td className="max-w-md px-4 py-3 text-slate-600">
                      {r.description}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => void onApprove(r.id)}
                        className="mr-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => void onDecline(r.id)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
