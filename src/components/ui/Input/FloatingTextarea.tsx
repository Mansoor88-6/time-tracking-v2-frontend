"use client";
import { forwardRef } from "react";

interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const FloatingTextarea = forwardRef<
  HTMLTextAreaElement,
  FloatingTextareaProps
>(({ label, error, id, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <textarea
        {...props}
        id={id}
        ref={ref}
        className={`
          peer w-full px-4 py-[0.95rem] border rounded-sm outline-none transition-all
          placeholder-transparent text-slate-900 dark:text-slate-200
          resize-none
          ${error ? "border-red-500" : "border-slate-300 dark:border-slate-500"}
          ${error ? "focus:border-red-500" : "focus:border-blue-500"}
          ${
            props.disabled
              ? "bg-slate-50 dark:bg-slate-600 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 hover:border-slate-400"
          }
        `}
        placeholder={label}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 -top-2.5 px-1 text-sm transition-all
          peer-placeholder-shown:text-base peer-placeholder-shown:top-[0.95rem] hover:cursor-text
          peer-focus:-top-2.5 peer-focus:text-sm
          ${error ? "text-red-500" : "text-gray-600 dark:text-gray-200"}
          ${
            props.disabled
              ? "text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-600"
              : ""
          }
          bg-white dark:bg-gray-800
        `}
      >
        {label}
      </label>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

FloatingTextarea.displayName = "FloatingTextarea";
