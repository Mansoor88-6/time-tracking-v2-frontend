/**
 * Centralized theme configuration
 * Single source of truth for all colors and themes
 */

import type { ThemeColors, ColorName } from "./types";

export const theme: ThemeColors = {
  semantic: {
    primary: {
      base: "#ef4581",      // Pink (matches CSS --color-primary)
      light: "#f4669f",     // Pink light (matches CSS --color-primary-light)
      lighter: "#f998bf",   // Pink lighter (matches CSS --color-primary-lighter)
      dark: "#d83d73",      // Pink dark (matches CSS --color-primary-dark)
      darker: "#b2335f",    // Pink darker (matches CSS --color-primary-darker)
      button: "bg-primary hover:bg-primary-light text-white", // Uses CSS variable for consistency
    },
    secondary: {
      base: "#ec4899",      // Pink-500
      light: "#f9a8d4",     // Pink-300
      dark: "#db2777",      // Pink-600
    },
    accent: "#8b5cf6",      // Violet-500
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-600 dark:text-emerald-400",
      icon: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      button: "bg-emerald-600 hover:bg-emerald-700",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-600 dark:text-amber-400",
      icon: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      button: "bg-amber-600 hover:bg-amber-700",
      accent: "text-amber-600 dark:text-amber-400",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-600 dark:text-red-400",
      icon: "text-red-600 dark:text-red-400",
      badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      button: "bg-red-600 hover:bg-red-700",
      accent: "text-red-600 dark:text-red-400",
    },
    info: {
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "border-indigo-200 dark:border-indigo-800",
      text: "text-indigo-600 dark:text-indigo-400",
      icon: "text-indigo-600 dark:text-indigo-400",
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      button: "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
      accent: "text-indigo-600 dark:text-indigo-400",
    },
  },
  chart: {
    teal: "#14b8a6",       // Teal-500
    coral: "#f43f5e",      // Rose-500
    yellow: "#f59e0b",     // Amber-500
    navy: "#3730a3",       // Indigo-800
    pink: "#ec4899",       // Pink-500
  },
  category: {
    productive: {
      bg: "bg-white dark:bg-[#1c1c2e]",
      border: "border-emerald-300 dark:border-emerald-700/50",
      text: "text-slate-900 dark:text-slate-100",
      icon: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      accent: "border-l-4 border-l-emerald-500 dark:border-l-emerald-400",
    },
    unproductive: {
      bg: "bg-white dark:bg-[#1c1c2e]",
      border: "border-red-300 dark:border-red-700/50",
      text: "text-slate-900 dark:text-slate-100",
      icon: "text-red-600 dark:text-red-400",
      badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      accent: "border-l-4 border-l-red-500 dark:border-l-red-400",
    },
    neutral: {
      bg: "bg-white dark:bg-[#1c1c2e]",
      border: "border-violet-300 dark:border-violet-700/50",
      text: "text-slate-900 dark:text-slate-100",
      icon: "text-violet-600 dark:text-violet-400",
      badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
      accent: "border-l-4 border-l-violet-500 dark:border-l-violet-400",
    },
  },
  palette: {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800/50",
      text: "text-blue-600 dark:text-blue-400",
      icon: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      button: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
      accent: "text-blue-600 dark:text-blue-400",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-800/50",
      text: "text-purple-600 dark:text-purple-400",
      icon: "text-purple-600 dark:text-purple-400",
      badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      button: "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600",
      accent: "text-purple-600 dark:text-purple-400",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800/50",
      text: "text-emerald-600 dark:text-emerald-400",
      icon: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      button: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800/50",
      text: "text-orange-600 dark:text-orange-400",
      icon: "text-orange-600 dark:text-orange-400",
      badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      button: "bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600",
      accent: "text-orange-600 dark:text-orange-400",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800/50",
      text: "text-red-600 dark:text-red-400",
      icon: "text-red-600 dark:text-red-400",
      badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      button: "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
      accent: "text-red-600 dark:text-red-400",
    },
    cyan: {
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      border: "border-cyan-200 dark:border-cyan-800/50",
      text: "text-cyan-600 dark:text-cyan-400",
      icon: "text-cyan-600 dark:text-cyan-400",
      badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
      button: "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600",
      accent: "text-cyan-600 dark:text-cyan-400",
    },
    yellow: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800/50",
      text: "text-amber-600 dark:text-amber-400",
      icon: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      button: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600",
      accent: "text-amber-600 dark:text-amber-400",
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "border-indigo-200 dark:border-indigo-800/50",
      text: "text-indigo-600 dark:text-indigo-400",
      icon: "text-indigo-600 dark:text-indigo-400",
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      button: "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
      accent: "text-indigo-600 dark:text-indigo-400",
    },
    teal: {
      bg: "bg-teal-50 dark:bg-teal-900/20",
      border: "border-teal-200 dark:border-teal-800/50",
      text: "text-teal-600 dark:text-teal-400",
      icon: "text-teal-600 dark:text-teal-400",
      badge: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
      button: "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600",
      accent: "text-teal-600 dark:text-teal-400",
    },
    coral: {
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "border-rose-200 dark:border-rose-800/50",
      text: "text-rose-600 dark:text-rose-400",
      icon: "text-rose-600 dark:text-rose-400",
      badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
      button: "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600",
      accent: "text-rose-600 dark:text-rose-400",
    },
    navy: {
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "border-indigo-200 dark:border-indigo-800/50",
      text: "text-indigo-700 dark:text-indigo-300",
      icon: "text-indigo-700 dark:text-indigo-300",
      badge: "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200",
      button: "bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-700",
      accent: "text-indigo-700 dark:text-indigo-300",
    },
    pink: {
      bg: "bg-pink-50 dark:bg-pink-900/20",
      border: "border-pink-200 dark:border-pink-800/50",
      text: "text-pink-600 dark:text-pink-400",
      icon: "text-pink-600 dark:text-pink-400",
      badge: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      button: "bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700",
      accent: "text-pink-600 dark:text-pink-400",
    },
    gray: {
      bg: "bg-slate-50 dark:bg-slate-900/20",
      border: "border-slate-200 dark:border-slate-800/50",
      text: "text-slate-600 dark:text-slate-400",
      icon: "text-slate-600 dark:text-slate-400",
      badge: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
      button: "bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600",
      accent: "text-slate-600 dark:text-slate-400",
    },
    slate: {
      bg: "bg-slate-50 dark:bg-slate-900/20",
      border: "border-slate-200 dark:border-slate-800/50",
      text: "text-slate-600 dark:text-slate-400",
      icon: "text-slate-600 dark:text-slate-400",
      badge: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
      button: "bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600",
      accent: "text-slate-600 dark:text-slate-400",
    },
  },
  background: {
    light: {
      bg: "#f8fafc",        // Slate-50
      card: "#ffffff",
      text: "#0f172a",      // Slate-900
    },
    dark: {
      bg: "#0a0a0f",        // Deep dark base
      card: "#1c1c2e",      // Dark card
      text: "#f8fafc",      // Slate-50
    },
  },
};

/**
 * Get color classes for a given color name
 */
export function getColorClasses(colorName: ColorName): typeof theme.palette.blue {
  return theme.palette[colorName] || theme.palette.blue;
}

/**
 * Get category styles
 */
export function getCategoryStyles(categoryName: "productive" | "unproductive" | "neutral") {
  return theme.category[categoryName];
}

/**
 * Get chart color value
 */
export function getChartColor(colorName: "teal" | "coral" | "yellow" | "navy" | "pink"): string {
  return theme.chart[colorName];
}

/**
 * Get chart color class name
 */
export function getChartColorClass(colorName: "teal" | "coral" | "yellow" | "navy" | "pink"): string {
  return `stroke-chart-${colorName}`;
}
