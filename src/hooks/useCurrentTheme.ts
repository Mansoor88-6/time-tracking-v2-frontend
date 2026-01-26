// hooks/useCurrentTheme.ts
// "use client";
import { useTheme } from "next-themes";

export const useCurrentTheme = () => {
  const { theme, systemTheme } = useTheme(); // Get the current theme (light, dark, or system)

  // If theme is system, convert it to light or dark based on the system's theme
  const currentTheme =
    theme === "system" ? (systemTheme === "dark" ? "dark" : "light") : theme;

  return currentTheme;
};
