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

function formatRangeStartEnd(startAt: string, endAt: string): string {
  const a = new Date(startAt);
  const b = new Date(endAt);
  return `${a.toLocaleString()} → ${b.toLocaleString()}`;
}

function formatRange(r: OfflineTimeRequestDto): string {
  return formatRangeStartEnd(r.startAt, r.endAt);
}

function durationMs(r: OfflineTimeRequestDto): number {
  return Math.max(
    0,
    new Date(r.endAt).getTime() - new Date(r.startAt).getTime(),
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

type PendingRow =
  | { kind: "batch"; batchId: string; items: OfflineTimeRequestDto[] }
  | { kind: "single"; item: OfflineTimeRequestDto };

function buildPendingRows(
  pending: OfflineTimeRequestDto[],
): PendingRow[] {
  const batchMap = new Map<string, OfflineTimeRequestDto[]>();
  const singles: OfflineTimeRequestDto[] = [];
  for (const r of pending) {
    if (r.submitBatchId) {
      const arr = batchMap.get(r.submitBatchId) ?? [];
      arr.push(r);
      batchMap.set(r.submitBatchId, arr);
    } else {
      singles.push(r);
    }
  }
  const rows: PendingRow[] = [];
  for (const [, items] of batchMap) {
    items.sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );
    rows.push({ kind: "batch", batchId: items[0].submitBatchId!, items });
  }
  for (const item of singles) {
    rows.push({ kind: "single", item });
  }
  return rows;
}

function rowEarliestMs(row: PendingRow): number {
  if (row.kind === "single") {
    return new Date(row.item.startAt).getTime();
  }
  return Math.min(
    ...row.items.map((r) => new Date(r.startAt).getTime()),
  );
}

function batchTotalMs(items: OfflineTimeRequestDto[]): number {
  return items.reduce((acc, r) => acc + durationMs(r), 0);
}

function batchEnvelope(items: OfflineTimeRequestDto[]): {
  startAt: string;
  endAt: string;
} {
  let minS = new Date(items[0].startAt).getTime();
  let maxE = new Date(items[0].endAt).getTime();
  for (const r of items) {
    minS = Math.min(minS, new Date(r.startAt).getTime());
    maxE = Math.max(maxE, new Date(r.endAt).getTime());
  }
  return {
    startAt: new Date(minS).toISOString(),
    endAt: new Date(maxE).toISOString(),
  };
}

type DurationSort = "none" | "asc" | "desc";

export default function OfflineTimeRequestsPage() {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<User[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
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

  const pendingRows = useMemo(() => {
    if (!pending?.length) return [];
    return buildPendingRows(pending);
  }, [pending]);

  const sortedRows = useMemo(() => {
    if (!pendingRows.length) return pendingRows;
    if (durationSort === "none") {
      return [...pendingRows].sort((a, b) => rowEarliestMs(a) - rowEarliestMs(b));
    }
    const dur = (row: PendingRow) =>
      row.kind === "single"
        ? durationMs(row.item)
        : batchTotalMs(row.items);
    const copy = [...pendingRows];
    copy.sort((a, b) => {
      const da = dur(a);
      const db = dur(b);
      return durationSort === "asc" ? da - db : db - da;
    });
    return copy;
  }, [pendingRows, durationSort]);

  const cycleDurationSort = useCallback(() => {
    setDurationSort((s) =>
      s === "none" ? "asc" : s === "asc" ? "desc" : "none",
    );
  }, []);

  const onApproveOne = useCallback(
    async (id: number) => {
      setBusyKey(`id:${id}`);
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
        setBusyKey(null);
      }
    },
    [queryClient],
  );

  const onApproveBatch = useCallback(
    async (items: OfflineTimeRequestDto[]) => {
      const key = `batch:${items.map((i) => i.id).join(",")}`;
      setBusyKey(key);
      try {
        for (const r of items) {
          await approveOfflineTimeRequest(r.id);
        }
        toast.success(
          `${items.length} requests approved. Time was applied to reports.`,
        );
        await queryClient.invalidateQueries({
          queryKey: ["offline-time-requests"],
        });
        await queryClient.invalidateQueries({ queryKey: ["timeline"] });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Approve failed");
      } finally {
        setBusyKey(null);
      }
    },
    [queryClient],
  );

  const onDeclineOne = useCallback(
    async (id: number) => {
      setBusyKey(`id:${id}`);
      try {
        await declineOfflineTimeRequest(id, undefined);
        toast.success("Request declined.");
        await queryClient.invalidateQueries({
          queryKey: ["offline-time-requests"],
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Decline failed");
      } finally {
        setBusyKey(null);
      }
    },
    [queryClient],
  );

  const onDeclineBatch = useCallback(
    async (items: OfflineTimeRequestDto[]) => {
      const key = `batch:${items.map((i) => i.id).join(",")}`;
      setBusyKey(key);
      try {
        for (const r of items) {
          await declineOfflineTimeRequest(r.id, undefined);
        }
        toast.success(`${items.length} requests declined.`);
        await queryClient.invalidateQueries({
          queryKey: ["offline-time-requests"],
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Decline failed");
      } finally {
        setBusyKey(null);
      }
    },
    [queryClient],
  );

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <PageHeader
          title="Offline time requests"
          description="Review requests from team members who want idle or untracked time reclassified. Approving inserts the time into productivity reports. Multi-segment submissions from one drag appear as one row."
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
                      title="Sort by duration: shortest first, longest first, or earliest start"
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
                {sortedRows.map((row) => {
                  if (row.kind === "single") {
                    const r = row.item;
                    const rowBusy = busyKey === `id:${r.id}`;
                    return (
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
                            disabled={busyKey !== null}
                            onClick={() => void onApproveOne(r.id)}
                            className="mr-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {rowBusy ? "…" : "Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={busyKey !== null}
                            onClick={() => void onDeclineOne(r.id)}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            {rowBusy ? "…" : "Decline"}
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  const { items, batchId } = row;
                  const totalMs = batchTotalMs(items);
                  const env = batchEnvelope(items);
                  const batchBusyKey = `batch:${items.map((i) => i.id).join(",")}`;
                  const rowBusy = busyKey === batchBusyKey;
                  return (
                    <tr
                      key={`batch-${batchId}`}
                      className="hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3 text-slate-900">
                        {userNameById.get(items[0].userId) ??
                          `User #${items[0].userId}`}
                      </td>
                      <td className="max-w-md px-4 py-3 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {formatRangeStartEnd(env.startAt, env.endAt)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {items.length} disconnected intervals (same submission)
                        </div>
                        <ul className="mt-1.5 list-inside list-disc text-xs text-slate-500">
                          {items.map((seg) => (
                            <li key={seg.id}>
                              {formatRange(seg)} ·{" "}
                              {formatDuration(durationMs(seg))}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-800">
                        <div>{formatDuration(totalMs)}</div>
                        <div className="text-xs font-normal text-slate-500">
                          total
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-800">
                        {items[0].category}
                      </td>
                      <td className="max-w-md px-4 py-3 text-slate-600">
                        {items[0].description}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={busyKey !== null}
                          onClick={() => void onApproveBatch(items)}
                          className="mr-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {rowBusy
                            ? "…"
                            : `Approve all (${items.length})`}
                        </button>
                        <button
                          type="button"
                          disabled={busyKey !== null}
                          onClick={() => void onDeclineBatch(items)}
                          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {rowBusy ? "…" : "Decline all"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
