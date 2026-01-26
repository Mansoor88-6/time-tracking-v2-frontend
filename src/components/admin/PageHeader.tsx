"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "default" | "outline";
  }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  primaryAction,
  secondaryActions,
}) => {
  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {(primaryAction || secondaryActions) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {secondaryActions?.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  action.variant === "outline"
                    ? "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                {action.label}
              </button>
            ))}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {primaryAction.icon && (
                  <span className="w-4 h-4">{primaryAction.icon}</span>
                )}
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
