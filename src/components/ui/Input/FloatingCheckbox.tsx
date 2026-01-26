"use client";
import { forwardRef } from "react";

interface FloatingCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingCheckbox = forwardRef<
  HTMLInputElement,
  FloatingCheckboxProps
>(({ label, error, id, ...props }, ref) => {
  return (
    <div
      className={`flex items-center max-h-fit ps-4 rounded-sm border   ${
        error ? "border-red-500" : "border-slate-300 dark:border-slate-500 "
      }
              ${error ? "focus:border-red-500" : "focus:border-blue-500"}
              ${
                props.disabled
                  ? "bg-slate-50 dark:bg-slate-600 cursor-not-allowed"
                  : "bg-white dark:bg-gray-800 hover:border-slate-400"
              }`}
    >
      <input
        {...props}
        id={id}
        ref={ref}
        type="checkbox"
        className={`h-4 w-4  rounded-sm accent-primary focus:accent-primary disabled:cursor-not-allowed disabled:opacity-50
            ${error ? "accent-red-500" : ""}
         
            ${
              props.disabled
                ? "bg-slate-50 dark:bg-slate-600 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 hover:border-slate-400"
            }
            
          `}
      />

      <label
        htmlFor={id}
        className={`
           w-full py-[1.15rem] ms-2 text-sm text-gray-900 dark:text-white
            ${error ? "text-red-500" : "text-gray-600 dark:text-gray-200"}
            ${
              props.disabled
                ? "text-slate-400 dark:text-slate-400 cursor-not-allowed "
                : ""
            }
            
          `}
      >
        {label}
      </label>
      {error && <p className=" mx-2 text-sm  text-red-500">{error}</p>}
    </div>
  );
});

FloatingCheckbox.displayName = "FloatingCheckbox";
