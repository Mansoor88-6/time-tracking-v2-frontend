"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  approveOfflineTimeRequest,
  declineOfflineTimeRequest,
  listPendingOfflineTimeRequestsForAdmin,
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

function formatDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfLocalDayIso(dateValue: string): string {
  const [y, m, d] = dateValue.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
}

function endOfLocalDayIso(dateValue: string): string {
  const [y, m, d] = dateValue.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
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

function rowSelectionKey(row: PendingRow): string {
  return row.kind === "single" ? `id:${row.item.id}` : `batch:${row.batchId}`;
}

function rowItems(row: PendingRow): OfflineTimeRequestDto[] {
  return row.kind === "single" ? [row.item] : row.items;
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
  const [selectedUserId, setSelectedUserId] = useState<number | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    void usersApi
      .list()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const userNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const u of users) {
      m.set(u.id, u.displayName || u.name || u.email);
    }
    return m;
  }, [users]);

  const requestFilters = useMemo(
    () => ({
      userId: selectedUserId === "all" ? undefined : selectedUserId,
      startDate: dateFrom ? startOfLocalDayIso(dateFrom) : undefined,
      endDate: dateTo ? endOfLocalDayIso(dateTo) : undefined,
    }),
    [dateFrom, dateTo, selectedUserId],
  );

  const { data: pending, isLoading, error } = useQuery({
    queryKey: ["offline-time-requests", "pending", requestFilters],
    queryFn: () => listPendingOfflineTimeRequestsForAdmin(requestFilters),
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

  const visibleRowKeys = useMemo(
    () => sortedRows.map((row) => rowSelectionKey(row)),
    [sortedRows],
  );

  useEffect(() => {
    setSelectedRowKeys((prev) =>
      prev.filter((key) => visibleRowKeys.includes(key)),
    );
  }, [visibleRowKeys]);

  const selectedRequests = useMemo(() => {
    if (!selectedRowKeys.length) return [];
    const selected = new Set(selectedRowKeys);
    return sortedRows
      .filter((row) => selected.has(rowSelectionKey(row)))
      .flatMap(rowItems);
  }, [selectedRowKeys, sortedRows]);

  const selectedTotalMs = useMemo(
    () => selectedRequests.reduce((acc, r) => acc + durationMs(r), 0),
    [selectedRequests],
  );

  const allVisibleSelected =
    visibleRowKeys.length > 0 &&
    visibleRowKeys.every((key) => selectedRowKeys.includes(key));

  const someVisibleSelected =
    selectedRowKeys.length > 0 && !allVisibleSelected;

  const toggleRowSelection = useCallback((key: string) => {
    setSelectedRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const toggleAllVisibleRows = useCallback(() => {
    setSelectedRowKeys((prev) =>
      visibleRowKeys.every((key) => prev.includes(key)) ? [] : visibleRowKeys,
    );
  }, [visibleRowKeys]);

  const cycleDurationSort = useCallback(() => {
    setDurationSort((s) =>
      s === "none" ? "asc" : s === "asc" ? "desc" : "none",
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedUserId("all");
    setDateFrom("");
    setDateTo("");
  }, []);

  const setTodayFilter = useCallback(() => {
    const today = formatDateInputValue(new Date());
    setDateFrom(today);
    setDateTo(today);
  }, []);

  const setLastSevenDaysFilter = useCallback(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    setDateFrom(formatDateInputValue(start));
    setDateTo(formatDateInputValue(end));
  }, []);

  const activeFilterCount = useMemo(() => {
    return [
      selectedUserId !== "all",
      Boolean(dateFrom),
      Boolean(dateTo),
    ].filter(Boolean).length;
  }, [dateFrom, dateTo, selectedUserId]);

  const resultSummary = useMemo(() => {
    const requestCount = pending?.length ?? 0;
    const rowCount = sortedRows.length;
    const totalMs = pending?.reduce((acc, r) => acc + durationMs(r), 0) ?? 0;
    return { requestCount, rowCount, totalMs };
  }, [pending, sortedRows]);

  const handleDateFromChange = useCallback((value: string) => {
    setDateFrom(value);
    if (value && dateTo && value > dateTo) {
      setDateTo(value);
    }
  }, [dateTo]);

  const handleDateToChange = useCallback((value: string) => {
    setDateTo(value);
    if (value && dateFrom && value < dateFrom) {
      setDateFrom(value);
    }
  }, [dateFrom]);

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

  const onApproveSelected = useCallback(async () => {
    if (!selectedRequests.length) return;
    setBusyKey("bulk:approve");
    try {
      for (const r of selectedRequests) {
        await approveOfflineTimeRequest(r.id);
      }
      toast.success(
        `${selectedRequests.length} selected request${
          selectedRequests.length === 1 ? "" : "s"
        } approved. Time was applied to reports.`,
      );
      setSelectedRowKeys([]);
      await queryClient.invalidateQueries({
        queryKey: ["offline-time-requests"],
      });
      await queryClient.invalidateQueries({ queryKey: ["timeline"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve selected failed");
    } finally {
      setBusyKey(null);
    }
  }, [queryClient, selectedRequests]);

  const onDeclineSelected = useCallback(async () => {
    if (!selectedRequests.length) return;
    setBusyKey("bulk:decline");
    try {
      for (const r of selectedRequests) {
        await declineOfflineTimeRequest(r.id, undefined);
      }
      toast.success(
        `${selectedRequests.length} selected request${
          selectedRequests.length === 1 ? "" : "s"
        } declined.`,
      );
      setSelectedRowKeys([]);
      await queryClient.invalidateQueries({
        queryKey: ["offline-time-requests"],
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Decline selected failed");
    } finally {
      setBusyKey(null);
    }
  }, [queryClient, selectedRequests]);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <PageHeader
          title="Offline time requests"
          description="Review requests from team members who want idle or untracked time reclassified. Approving inserts the time into productivity reports. Multi-segment submissions from one drag appear as one row."
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Filters
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Narrow pending requests by employee and the time range they are
                asking to add.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={setTodayFilter}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Today
              </button>
              <button
                type="button"
                onClick={setLastSevenDaysFilter}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Last 7 days
              </button>
              <button
                type="button"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Clear filters
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                User
              </span>
              <select
                value={selectedUserId}
                onChange={(e) =>
                  setSelectedUserId(
                    e.target.value === "all" ? "all" : Number(e.target.value),
                  )
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="all">All users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName || u.name || u.email}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                From date
              </span>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                To date
              </span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900/60 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-50">
                {resultSummary.rowCount}
              </strong>{" "}
              table row{resultSummary.rowCount === 1 ? "" : "s"} from{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-50">
                {resultSummary.requestCount}
              </strong>{" "}
              pending request
              {resultSummary.requestCount === 1 ? "" : "s"}.
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              Total requested: {formatDuration(resultSummary.totalMs)}
            </span>
          </div>
        </section>

        {isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : "Failed to load"}
          </p>
        ) : !pending?.length ? (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {activeFilterCount > 0
              ? "No pending requests match these filters."
              : "No pending requests."}
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  {selectedRowKeys.length}
                </span>{" "}
                row{selectedRowKeys.length === 1 ? "" : "s"} selected
                {selectedRequests.length > 0 ? (
                  <>
                    {" "}
                    ({selectedRequests.length} request
                    {selectedRequests.length === 1 ? "" : "s"},{" "}
                    {formatDuration(selectedTotalMs)})
                  </>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void onApproveSelected()}
                  disabled={selectedRequests.length === 0 || busyKey !== null}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyKey === "bulk:approve"
                    ? "Approving..."
                    : `Approve selected (${selectedRequests.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => void onDeclineSelected()}
                  disabled={selectedRequests.length === 0 || busyKey !== null}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {busyKey === "bulk:decline"
                    ? "Declining..."
                    : `Decline selected (${selectedRequests.length})`}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-12 px-4 py-3 text-left font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      aria-checked={
                        someVisibleSelected ? "mixed" : allVisibleSelected
                      }
                      onChange={toggleAllVisibleRows}
                      disabled={visibleRowKeys.length === 0 || busyKey !== null}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                      title="Select all visible rows"
                    />
                  </th>
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
                  const selectionKey = rowSelectionKey(row);
                  const selected = selectedRowKeys.includes(selectionKey);
                  if (row.kind === "single") {
                    const r = row.item;
                    const rowBusy = busyKey === `id:${r.id}`;
                    return (
                      <tr
                        key={r.id}
                        className={
                          selected
                            ? "bg-emerald-50/60 hover:bg-emerald-50"
                            : "hover:bg-slate-50/80"
                        }
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleRowSelection(selectionKey)}
                            disabled={busyKey !== null}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                            title={`Select request from ${
                              userNameById.get(r.userId) ?? `User #${r.userId}`
                            }`}
                          />
                        </td>
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
                      className={
                        selected
                          ? "bg-emerald-50/60 hover:bg-emerald-50"
                          : "hover:bg-slate-50/80"
                      }
                    >
                      <td className="px-4 py-3 align-top">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRowSelection(selectionKey)}
                          disabled={busyKey !== null}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                          title={`Select ${items.length} request segment${
                            items.length === 1 ? "" : "s"
                          }`}
                        />
                      </td>
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
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
