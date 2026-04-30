"use client";

import { useMemo, useState } from "react";
import {
  BiSearch,
  BiFilter,
  BiSortAlt2,
  BiHelpCircle,
  BiEnvelope,
} from "react-icons/bi";
import type { ColleagueDto } from "@/services/colleagues";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu/DropdownMenu";

type SortKey = "name-asc" | "name-desc" | "online-first" | "offline-first";

function displayName(c: ColleagueDto): string {
  return (
    (c.displayName && c.displayName.trim()) ||
    (c.name && c.name.trim()) ||
    c.email
  );
}

export function ColleaguesSection(props: {
  windowSec: number;
  colleagues: ColleagueDto[];
  isLoading: boolean;
  errorMessage: string | null;
  /** When false, omit the section H2 (e.g. page supplies a main title). */
  showHeading?: boolean;
}) {
  const {
    windowSec,
    colleagues,
    isLoading,
    errorMessage,
    showHeading = true,
  } = props;
  const [search, setSearch] = useState("");
  const [teamIdFilter, setTeamIdFilter] = useState<number | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name-asc");

  const teamOptions = useMemo(() => {
    const byId = new Map<number, string>();
    for (const c of colleagues) {
      for (const t of c.teams) {
        if (!byId.has(t.id)) byId.set(t.id, t.name);
      }
    }
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [colleagues]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = colleagues.filter((c) => {
      if (teamIdFilter === "all") return true;
      return c.teams.some((t) => t.id === teamIdFilter);
    });
    if (q) {
      list = list.filter((c) => {
        const n = displayName(c).toLowerCase();
        return n.includes(q) || c.email.toLowerCase().includes(q);
      });
    }
    const sorted = [...list];
    if (sortKey === "name-asc") {
      sorted.sort((a, b) =>
        displayName(a).localeCompare(displayName(b), undefined, {
          sensitivity: "base",
        })
      );
    } else if (sortKey === "name-desc") {
      sorted.sort((a, b) =>
        displayName(b).localeCompare(displayName(a), undefined, {
          sensitivity: "base",
        })
      );
    } else if (sortKey === "online-first") {
      sorted.sort((a, b) =>
        a.isOnline === b.isOnline
          ? displayName(a).localeCompare(displayName(b))
          : a.isOnline
            ? -1
            : 1
      );
    } else {
      sorted.sort((a, b) =>
        a.isOnline === b.isOnline
          ? displayName(a).localeCompare(displayName(b))
          : a.isOnline
            ? 1
            : -1
      );
    }
    return sorted;
  }, [colleagues, search, teamIdFilter, sortKey]);

  const helpTitle = `Online means the colleague’s device sent a tracking event within the last ${windowSec} seconds. Status refreshes periodically; there are no live sockets.`;

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/30">
      <div
        className={`mb-4 flex flex-col gap-3 sm:flex-row sm:items-center ${
          showHeading ? "sm:justify-between" : "sm:justify-end"
        }`}
      >
        {showHeading ? (
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Colleagues
          </h2>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[10rem] flex-1 sm:max-w-xs">
            <BiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search colleagues"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              aria-label="Search colleagues"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <BiFilter className="h-4 w-4" />
              Filter
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[12rem]">
              <DropdownMenuItem onClick={() => setTeamIdFilter("all")}>
                All teams
              </DropdownMenuItem>
              {teamOptions.length === 0 ? (
                <div className="px-2 py-2 text-xs text-slate-500">
                  No teams in roster
                </div>
              ) : (
                teamOptions.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => setTeamIdFilter(t.id)}
                  >
                    {t.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <BiSortAlt2 className="h-4 w-4" />
              Sort
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[12rem]">
              <DropdownMenuItem onClick={() => setSortKey("name-asc")}>
                Name A–Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortKey("name-desc")}>
                Name Z–A
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortKey("online-first")}>
                Online first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortKey("offline-first")}>
                Offline first
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            title={helpTitle}
            aria-label="About online status"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <BiHelpCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {teamIdFilter !== "all" ? (
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Filtering by team:{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {teamOptions.find((t) => t.id === teamIdFilter)?.name ?? "Team"}
          </span>
          {" · "}
          <button
            type="button"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
            onClick={() => setTeamIdFilter("all")}
          >
            Clear
          </button>
        </p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <article
              key={c.id}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-600 dark:bg-slate-800/80"
            >
              <div className="relative shrink-0">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                  aria-hidden
                >
                  {c.avatarInitial}
                </div>
                <span
                  className={`absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 ${
                    c.isOnline
                      ? "bg-emerald-500"
                      : "bg-slate-300 dark:bg-slate-500"
                  }`}
                  title={c.isOnline ? "Online" : "Offline"}
                  aria-label={c.isOnline ? "Online" : "Offline"}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                  {displayName(c)}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {c.teamLabel}
                </p>
                <hr className="my-2 border-slate-100 dark:border-slate-700" />
                <p className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <BiEnvelope className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="break-all">{c.email}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && !errorMessage && filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No colleagues match your search or filter.
        </p>
      ) : null}
    </section>
  );
}
