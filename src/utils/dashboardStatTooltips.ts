import type { Period } from "@/utils/dateRange";

/**
 * Hover text for dashboard stat cards (individual / user-view).
 */
export function getIndividualStatTooltip(
  label: string,
  period: Period
): string | undefined {
  const scope =
    period === "week"
      ? "the selected week"
      : period === "month"
        ? "the selected month"
        : "the selected day";

  const map: Record<string, string> = {
    "Arrival Time": `The first time your activity was tracked for ${scope}.`,
    "Left Time": `The last time your activity was tracked for ${scope}. If you are still online, a time appears after you end your session.`,
    "Productive Time": `Total time counted as productive work for ${scope}.`,
    "Productivity Score": `Share of tracked time that was productive, for the week shown on the card (rolling weekly metric).`,
    "Effectiveness": `How effectively your tracked time maps to productive work, for the week shown (rolling weekly metric).`,
    "Projects Time": `Time attributed to project-related activity for ${scope}.`,
  };

  return map[label];
}

/**
 * Hover text for organization aggregated stat cards.
 */
export function getOrgStatTooltip(label: string): string | undefined {
  const map: Record<string, string> = {
    "Total Productive Time": `Sum of productive time across users included in the current filters.`,
    "Average Productivity Score": `Mean productivity score across users who had any tracked time in the selected period (users with no tracking are excluded from the average).`,
    "Users with tracked time": `How many users had any tracked activity in the selected period, out of all users in scope (same users as the table below).`,
    "Average Effectiveness": `Mean effectiveness across users who had any tracked time in the selected period (users with no tracking are excluded from the average).`,
    "Total Projects Time": `Sum of project-attributed time across users matching the current filters.`,
  };

  return map[label];
}
