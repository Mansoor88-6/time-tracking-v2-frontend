"use client";

import { FiSun, FiMoon } from "react-icons/fi";
import { BiDesktop } from "react-icons/bi";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // This will ensure that the button does not render until the theme has been properly mounted
  if (!mounted) {
    return (
      <div className="w-5 h-5 border-4 border-t-4 dark:border-gray-800 dark:border-t-sky-600 border-gray-200 border-t-sky-600 rounded-full animate-spin"></div>
    );
  }

  const handleToggle = () => {
    // Cycle through the themes: 'light', 'dark', and 'system'
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  const getIcon = () => {
    if (theme === "dark") {
      return (
        <FiMoon
          onClick={handleToggle}
          className="w-6 h-6 cursor-pointer text-yellow-500"
        />
      );
    } else if (theme === "light") {
      return (
        <FiSun
          onClick={handleToggle}
          className="w-6 h-6 cursor-pointer text-slate-950 dark:text-slate-100"
        />
      );
    } else {
      return (
        <BiDesktop
          onClick={handleToggle}
          className="w-6 h-6 cursor-pointer text-sky-600"
        />
      );
    }
  };

  return getIcon();
}
