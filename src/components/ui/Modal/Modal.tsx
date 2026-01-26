"use client";

// import { Cross } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Define size options for the modal
type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: ModalSize;
  className?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement;
      // Add event listener for escape key
      window.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
      // Focus the modal
      modalRef.current?.focus();
    } else {
      // Remove event listener
      window.removeEventListener("keydown", handleEscape);
      // Restore body scroll
      document.body.style.overflow = "unset";
      // Restore focus to previous element
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative z-50 w-full ${sizeClasses[size]}
          bg-white dark:bg-gray-800 rounded-lg shadow-xl
          transform transition-all
          animate-modal-enter
          ${className}
        `}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 sm:ml10 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-slate-900 dark:text-slate-50"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="p-4 overflow-y-auto max-h-[calc(100vh-10rem)]   
          [&::-webkit-scrollbar]:w-2 
          [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-track]:bg-slate-100
        [&::-webkit-scrollbar-thumb]:bg-slate-200
        dark:[&::-webkit-scrollbar-track]:bg-slate-700
        dark:[&::-webkit-scrollbar-thumb]:bg-slate-600"
        >
          {children}
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the modal at the end of the document body
  return createPortal(modalContent, document.body);
};

// Add keyframe animation to tailwind.config.js
/*
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'modal-enter': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95) translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)'
          },
        },
      },
      animation: {
        'modal-enter': 'modal-enter 0.2s ease-out',
      },
    },
  },
}
*/

export default Modal;
