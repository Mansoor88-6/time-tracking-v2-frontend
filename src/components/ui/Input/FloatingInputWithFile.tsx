"use client";
import { forwardRef, useState, useRef, MutableRefObject } from "react";
import { BiUpload, BiX } from "react-icons/bi";
// import { Upload, X } from "lucide-react";

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, type, id, onChange, ...props }, forwardedRef) => {
    const [showPassword, setShowPassword] = useState(false);
    const [fileName, setFileName] = useState<string>("");
    // Using MutableRefObject to fix the readonly error
    const inputRef = useRef<HTMLInputElement | null>(null);

    const isPasswordField = type === "password";
    const isFileField = type === "file";
    const inputType = isPasswordField && showPassword ? "text" : type;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
      } else {
        setFileName("");
      }
      if (onChange) {
        onChange(e);
      }
    };

    const clearFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFileName("");
      // Clear the input value using inputRef
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    const handleFieldClick = () => {
      if (inputRef.current) {
        inputRef.current.click();
      }
    };

    return (
      <div className="relative w-full">
        {isFileField ? (
          <div className="relative">
            <input
              {...props}
              id={id}
              // Use both refs
              ref={(element) => {
                inputRef.current = element;
                if (typeof forwardedRef === "function") {
                  forwardedRef(element);
                } else if (forwardedRef) {
                  (
                    forwardedRef as MutableRefObject<HTMLInputElement | null>
                  ).current = element;
                }
              }}
              type={inputType}
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              role="button"
              tabIndex={0}
              onClick={handleFieldClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleFieldClick();
                }
              }}
              className={`
                peer w-full px-4 h-[52px] border rounded-sm outline-none transition-all
                flex items-center cursor-pointer
                ${
                  error
                    ? "border-red-500"
                    : "border-slate-300 dark:border-slate-500"
                }
                ${
                  error
                    ? "focus-within:border-red-500"
                    : "focus-within:border-blue-500"
                }
                ${
                  props.disabled
                    ? "bg-slate-50 dark:bg-slate-600 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 hover:border-slate-400"
                }
              `}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-200 w-[70%]">
                  <BiUpload size={18} className="flex-shrink-0" />
                  <span className="text-sm truncate">
                    {fileName || "Choose file"}
                  </span>
                </div>
                <div className="flex items-center ml-auto">
                  {fileName && (
                    <button
                      onClick={clearFile}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0"
                    >
                      <BiX size={16} className="text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <input
            {...props}
            id={id}
            ref={forwardedRef}
            type={inputType}
            className={`
              peer w-full px-4 h-[52px] border rounded-sm outline-none transition-all
              placeholder-transparent
              ${
                error
                  ? "border-red-500"
                  : "border-slate-300 dark:border-slate-500"
              }
              ${error ? "focus:border-red-500" : "focus:border-blue-500"}
              ${
                props.disabled
                  ? "bg-slate-50 dark:bg-slate-600 cursor-not-allowed"
                  : "bg-white dark:bg-gray-800 hover:border-slate-400"
              }
            `}
            placeholder={label}
          />
        )}

        <label
          htmlFor={id}
          className={`
            absolute left-4 -top-2.5 px-1 text-sm transition-all
            peer-placeholder-shown:text-base peer-placeholder-shown:top-4 hover:cursor-text
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

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
          >
            {showPassword ? "👁️" : "🙈"}
          </button>
        )}

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;
