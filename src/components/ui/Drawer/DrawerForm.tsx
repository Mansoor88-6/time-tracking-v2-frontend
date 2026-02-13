"use client";

import React from "react";
import Drawer from "./Drawer";
import { cn } from "@/utils/tw";
import { getPrimaryButtonStyle, getSemanticColor } from "@/theme";

interface DrawerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  title: string;
  description?: string;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  submitVariant?: "primary" | "danger";
  side?: "left" | "right" | "top" | "bottom";
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
}

export const DrawerForm: React.FC<DrawerFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false,
  size = "md",
  submitVariant = "primary",
  side = "right",
  showOverlay = true,
  closeOnOverlayClick = true,
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  const submitStyles =
    submitVariant === "danger"
      ? getSemanticColor("error").button
      : getPrimaryButtonStyle();

  const footer = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className={cn(
          "px-4 py-2 text-sm font-medium",
          "text-slate-700 dark:text-slate-300",
          "bg-white dark:bg-slate-800",
          "border border-slate-300 dark:border-slate-600",
          "rounded-md",
          "hover:bg-slate-50 dark:hover:bg-slate-700",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors"
        )}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "px-4 py-2 text-sm font-medium text-white rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors",
          submitStyles
        )}
      >
        {isLoading ? "Saving..." : submitLabel}
      </button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      side={side}
      showOverlay={showOverlay}
      closeOnOverlayClick={closeOnOverlayClick}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}
      </form>
    </Drawer>
  );
};
