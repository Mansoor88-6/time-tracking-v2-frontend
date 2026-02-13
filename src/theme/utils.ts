/**
 * Theme utility functions
 * Centralized helpers for color class generation
 */

import { theme, getColorClasses, getCategoryStyles, getChartColorClass } from "./theme";
import type { ColorName, CategoryName, ChartColorName } from "./types";

/**
 * Get color classes for a given color name
 * Replaces duplicate getColorClasses functions across components
 */
export function getColorClassesUtil(colorName: ColorName) {
  return getColorClasses(colorName);
}

/**
 * Get category styles for productive/unproductive/neutral
 * Replaces hardcoded categoryStyles in AppUsageSection
 */
export function getCategoryStylesUtil(category: CategoryName) {
  return getCategoryStyles(category);
}

/**
 * Get badge color classes
 */
export function getBadgeColor(colorName: ColorName): string {
  const colors = getColorClasses(colorName);
  return colors.badge || colors.text;
}

/**
 * Get icon color classes
 */
export function getIconColor(colorName: ColorName): string {
  const colors = getColorClasses(colorName);
  return colors.icon || colors.text;
}

/**
 * Get chart color class name for CircularProgress
 */
export function getChartColorClassUtil(colorName: ChartColorName): string {
  return getChartColorClass(colorName);
}

/**
 * Get semantic color classes
 */
export function getSemanticColor(semanticName: "success" | "warning" | "error" | "info") {
  return theme.semantic[semanticName];
}

/**
 * Get primary button style (pink/primary color for main actions)
 * Matches PageHeader primaryAction button style
 */
export function getPrimaryButtonStyle(): string {
  return theme.semantic.primary.button || "bg-primary hover:bg-primary-light text-white";
}

/**
 * Get progress value color based on percentage
 * Used in StatCard for dynamic color based on progress value
 */
export function getProgressValueColor(progress: number): string {
  const p = Math.max(0, Math.min(100, progress));
  if (p < 40) return "text-red-600";
  if (p < 70) return "text-amber-600";
  return "text-emerald-700";
}

/**
 * Export theme for direct access if needed
 */
export { theme };
