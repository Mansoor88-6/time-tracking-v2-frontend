// components/FloatingSelect.tsx
// import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";
import { BiChevronDown } from "react-icons/bi";

interface Option {
  value: string | number;
  label: string;
}

interface FloatingSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: Option[];
}

export const FloatingSelect = forwardRef<
  HTMLSelectElement,
  FloatingSelectProps
>(({ label, error, options, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        {...props}
        ref={ref}
        className={`
            peer w-full px-4 py-[0.95rem] border rounded-sm outline-none transition-all
            appearance-none
            ${
              error
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-500"
            }
            ${error ? "focus:border-red-500" : "focus:border-blue-500"}
            ${
              props.disabled
                ? "bg-slate-50 dark:bg-slate-600 cursor-not-allowed"
                : "bg-white dark:bg-gray-800"
            }
            text-slate-900 dark:text-slate-200
          `}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        className={`
            absolute left-4 -top-2.5 px-1 text-sm transition-all
            peer-placeholder-shown:text-base peer-placeholder-shown:top-[0.95rem]
            peer-focus:-top-2.5 peer-focus:text-sm
            ${error ? "text-red-500" : "text-gray-600 dark:text-gray-200"}
            ${props.disabled ? "text-slate-400 dark:text-slate-400" : ""}
             bg-white dark:bg-gray-800
          `}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {/* For single line error top-1/3 */}
      <div
        className={`absolute right-4 -translate-y-1/2 pointer-events-none ${
          error ? "top-[1.56rem]" : "top-1/2"
        }`}
      >
        <BiChevronDown size={20} />
      </div>
    </div>
  );
});

FloatingSelect.displayName = "FloatingSelect";
