"use client";
import { useCurrentTheme } from "@/hooks/useCurrentTheme";
import "react-toastify/dist/ReactToastify.css";

import React from "react";
import { ToastContainer } from "react-toastify";

const ToastContainerTheme = () => {
  const theme = useCurrentTheme();
  return (
    // if appear behind the navbar, make it appear on top of screen
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
    </div>
  );
};

export default ToastContainerTheme;
