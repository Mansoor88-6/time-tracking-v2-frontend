"use client";

import React from "react";
import Modal from "@/components/ui/Modal/Modal";

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  title: string;
  description?: string;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  submitVariant?: "primary" | "danger";
}

export const ModalForm: React.FC<ModalFormProps> = ({
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
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  const submitStyles =
    submitVariant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
      : "bg-primary hover:bg-primary-light focus:ring-primary";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${submitStyles}`}
          >
            {isLoading ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
};
