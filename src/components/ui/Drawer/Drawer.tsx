"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/tw";
import { BiX } from "react-icons/bi";
import { getPrimaryButtonStyle } from "@/theme";

export type DrawerSide = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  description?: string;
  children: React.ReactNode;
  side?: DrawerSide;
  size?: DrawerSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  showOverlay?: boolean;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const sizeClasses: Record<DrawerSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "w-full",
};

const sideClasses: Record<DrawerSide, { container: string; panel: string; transform: { closed: string; open: string } }> = {
  right: {
    container: "right-0 top-0 h-full",
    panel: "h-full",
    transform: {
      closed: "translate-x-full",
      open: "translate-x-0",
    },
  },
  left: {
    container: "left-0 top-0 h-full",
    panel: "h-full",
    transform: {
      closed: "-translate-x-full",
      open: "translate-x-0",
    },
  },
  top: {
    container: "top-0 left-0 w-full",
    panel: "w-full",
    transform: {
      closed: "-translate-y-full",
      open: "translate-y-0",
    },
  },
  bottom: {
    container: "bottom-0 left-0 w-full",
    panel: "w-full",
    transform: {
      closed: "translate-y-full",
      open: "translate-y-0",
    },
  },
};

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = "right",
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  showOverlay = true,
  footer,
  header,
  className,
  contentClassName,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const sideConfig = sideClasses[side];
  const isVertical = side === "top" || side === "bottom";

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
      // Focus the drawer or close button
      setTimeout(() => {
        closeButtonRef.current?.focus() || drawerRef.current?.focus();
      }, 100);
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

  const drawerContent = (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "drawer-title" : undefined}
      aria-describedby={description ? "drawer-description" : undefined}
    >
      {/* Overlay */}
      {showOverlay && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />
      )}

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed z-50 bg-white dark:bg-slate-800 shadow-xl",
          "transition-transform duration-300 ease-out",
          sideConfig.container,
          isVertical ? sideConfig.panel : `${sideConfig.panel} ${sizeClasses[size]}`,
          isOpen ? sideConfig.transform.open : sideConfig.transform.closed,
          className
        )}
        tabIndex={-1}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          {header ? (
            <div className="flex-shrink-0">{header}</div>
          ) : (title || showCloseButton) ? (
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex-1 min-w-0 pr-4">
                {title && (
                  <h2
                    id="drawer-title"
                    className="text-xl font-semibold text-slate-900 dark:text-slate-100"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="drawer-description"
                    className="mt-1 text-sm text-slate-600 dark:text-slate-400"
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className={cn(
                    "flex-shrink-0 p-2 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md",
                    "transition-colors"
                  )}
                  aria-label="Close drawer"
                >
                  <BiX className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : null}

          {/* Content */}
          <div
            className={cn(
              "flex-1 overflow-y-auto",
              "p-4 sm:p-6",
              "[&::-webkit-scrollbar]:w-2",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-track]:bg-slate-100 dark:[&::-webkit-scrollbar-track]:bg-slate-700",
              "[&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600",
              contentClassName
            )}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 p-4 sm:p-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the drawer at the end of the document body
  return createPortal(drawerContent, document.body);
};

export default Drawer;
