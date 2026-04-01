"use client";
import "react-toastify/dist/ReactToastify.css";

import React from "react";
import { ToastContainer } from "react-toastify";

const ToastContainerTheme = () => (
  <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
    <ToastContainer theme="light" />
  </div>
);

export default ToastContainerTheme;
