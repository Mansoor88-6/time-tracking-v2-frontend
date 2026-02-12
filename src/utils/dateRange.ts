/**
 * Date Range Utilities
 * 
 * Helper functions for calculating date ranges for Day/Week/Month views
 */

export type Period = 'day' | 'week' | 'month';

/**
 * Calculate Monday-Sunday week range for a given date
 * @param date - Date within the week
 * @returns Start (Monday) and end (Sunday) dates of the week
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  // Calculate days to subtract to get to Monday (0 = Sunday, 1 = Monday, etc.)
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
}

/**
 * Calculate month range for a given date
 * @param date - Date within the month
 * @returns Start (first day) and end (last day) dates of the month
 */
export function getMonthRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Format date for display based on period
 * @param date - Date to format
 * @param period - Current period (day/week/month)
 * @returns Formatted date string
 */
export function formatPeriodDate(date: Date, period: Period): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  
  if (period === 'week') {
    const weekRange = getWeekRange(date);
    const startStr = weekRange.start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const endStr = weekRange.end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${startStr} - ${endStr}`;
  }
  
  if (period === 'month') {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }
  
  // Day view
  return date.toLocaleDateString('en-US', options);
}

/**
 * Navigate to previous or next period
 * @param date - Current date
 * @param period - Current period
 * @param direction - 'prev' or 'next'
 * @returns New date after navigation
 */
export function navigatePeriod(
  date: Date,
  period: Period,
  direction: 'prev' | 'next'
): Date {
  const newDate = new Date(date);
  const multiplier = direction === 'next' ? 1 : -1;
  
  if (period === 'day') {
    newDate.setDate(newDate.getDate() + multiplier);
  } else if (period === 'week') {
    newDate.setDate(newDate.getDate() + multiplier * 7);
  } else if (period === 'month') {
    newDate.setMonth(newDate.getMonth() + multiplier);
  }
  
  return newDate;
}

/**
 * Get date range for API query based on period
 * @param date - Current date
 * @param period - Current period
 * @returns Date range object for API
 */
export function getDateRangeForPeriod(
  date: Date,
  period: Period
): { date?: string; startDate?: string; endDate?: string } {
  if (period === 'day') {
    const dateStr = formatDateForAPI(date);
    return { date: dateStr };
  }
  
  if (period === 'week') {
    const { start, end } = getWeekRange(date);
    return {
      startDate: formatDateForAPI(start),
      endDate: formatDateForAPI(end),
    };
  }
  
  // Month
  const { start, end } = getMonthRange(date);
  return {
    startDate: formatDateForAPI(start),
    endDate: formatDateForAPI(end),
  };
}

/**
 * Format date to YYYY-MM-DD for API
 */
function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
