"use client";

import React, { useMemo, useState } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa6";

export interface AdminTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface AdminDataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: AdminTableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  className?: string;
}

export function AdminDataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  rowActions,
  className = "",
}: AdminDataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn as keyof T];
      const bVal = b[sortColumn as keyof T];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider ${col.headerClassName || ""}`}
                >
                  {col.label}
                </th>
              ))}
              {rowActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {columns.map((_, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  </td>
                ))}
                {rowActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 ${className}`}
    >
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900/50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                onClick={() =>
                  col.sortable && handleSort(col.key as string)
                }
                className={`px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider ${
                  col.sortable ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" : ""
                } ${col.headerClassName || ""}`}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && (
                    <span className="text-slate-400">
                      {sortColumn === col.key ? (
                        sortDirection === "asc" ? (
                          <FaSortUp className="w-3 h-3" />
                        ) : (
                          <FaSortDown className="w-3 h-3" />
                        )
                      ) : (
                        <FaSort className="w-3 h-3 opacity-30" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {rowActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {sortedData.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`${
                onRowClick
                  ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  : ""
              }`}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 ${col.className || ""}`}
                >
                  {col.render
                    ? col.render(row)
                    : String(row[col.key as keyof T] ?? "—")}
                </td>
              ))}
              {rowActions && (
                <td
                  className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {rowActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
