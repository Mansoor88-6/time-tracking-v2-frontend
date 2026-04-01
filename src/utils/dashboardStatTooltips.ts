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
    "Average Productivity Score": `Mean productivity score across those users for the selected period.`,
    "Total Active Users": `How many users had tracked activity in the selected period, compared to all users in scope.`,
    "Average Effectiveness": `Mean effectiveness across filtered users for the selected period.`,
    "Total Projects Time": `Sum of project-attributed time across users matching the current filters.`,
  };

  return map[label];
}
