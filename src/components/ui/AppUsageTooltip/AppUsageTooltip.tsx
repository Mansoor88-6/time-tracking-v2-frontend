"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/tw";
import { formatDuration } from "@/services/dashboardStats";
import type { UrlBreakdown } from "@/services/appUsage";

interface AppUsageTooltipProps {
  children: React.ReactNode;
  urlBreakdown: UrlBreakdown[];
  appName: string;
  totalTime: string;
}

export function AppUsageTooltip({
  children,
  urlBreakdown,
  appName,
  totalTime,
}: AppUsageTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    // Clear any pending show timeout
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    
    showTimeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        // Set initial position based on trigger element
        const triggerRect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: triggerRect.bottom + 8,
          left: triggerRect.left + triggerRect.width / 2,
        });
      }
      setIsVisible(true);
    }, 200); // 200ms delay to avoid flickering
  };

  const handleMouseLeave = () => {
    // Clear any pending show timeout
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    
    // Add small delay before hiding to allow mouse to move to tooltip
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setPosition(null);
    }, 100);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Detect sidebar width by finding the sidebar element
    // Sidebar can be w-64 (256px) when expanded or w-16 (64px) when collapsed
    // Also check for mobile sidebar which might be visible
    let sidebarWidth = 0;
    const sidebarElement = document.querySelector('[class*="sidebar-transition"]:not([class*="hidden"])') as HTMLElement;
    if (sidebarElement) {
      const sidebarRect = sidebarElement.getBoundingClientRect();
      // Only count sidebar if it's actually visible (width > 0 and on screen)
      if (sidebarRect.width > 0 && sidebarRect.right > 0) {
        sidebarWidth = sidebarRect.right; // Use right edge position instead of width
      }
    }

    // Margin from sidebar and edges
    const sidebarMargin = 16; // 16px margin from sidebar
    const edgeMargin = 16; // 16px margin from viewport edges
    const minLeft = sidebarWidth > 0 ? sidebarWidth + sidebarMargin : edgeMargin;
    const maxLeft = viewportWidth - edgeMargin;

    // Default: position below the trigger, centered
    // Since we use translateX(-50%), left should be the center point
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    let top = triggerRect.bottom + 8;
    let left = triggerCenterX;

    // Adjust if tooltip would overflow viewport horizontally
    const tooltipHalfWidth = tooltipRect.width / 2;
    
    // Check if tooltip would overlap with sidebar
    if (left - tooltipHalfWidth < minLeft) {
      left = minLeft + tooltipHalfWidth;
    }
    
    // Check if tooltip would overflow right edge
    if (left + tooltipHalfWidth > maxLeft) {
      left = maxLeft - tooltipHalfWidth;
    }
    
    // Ensure tooltip doesn't go too far left (minimum edge margin)
    if (left - tooltipHalfWidth < edgeMargin) {
      left = edgeMargin + tooltipHalfWidth;
    }

    // If tooltip would overflow bottom, position above
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = triggerRect.top - tooltipRect.height - 8;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      // Update position after tooltip is rendered and measured
      // Use multiple requestAnimationFrame calls to ensure tooltip is fully rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updatePosition();
        });
      });
      
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isVisible, urlBreakdown]);

  // Don't show tooltip if no breakdown data
  if (!urlBreakdown || urlBreakdown.length === 0) {
    return <>{children}</>;
  }

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-[99999] bg-white dark:bg-gray-800",
            "border border-gray-200 dark:border-gray-700",
            "rounded-lg shadow-xl",
            "p-3 min-w-[200px] max-w-[350px]",
            position ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          style={
            position
              ? {
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                  transform: "translateX(-50%)", // Center horizontally on the left position
                }
              : {
                  top: "-9999px",
                  left: "-9999px",
                }
          }
          onMouseEnter={() => {
            // Keep tooltip visible when hovering over it
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = null;
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header */}
          <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {appName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total: {totalTime}
            </p>
          </div>

          {/* Breakdown List */}
          <div className="max-h-[300px] overflow-y-auto">
            {urlBreakdown.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No breakdown available
              </p>
            ) : (
              <ul className="space-y-1.5">
                {urlBreakdown.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start justify-between gap-2 text-xs"
                  >
                    <span className="flex-1 min-w-0 text-gray-700 dark:text-gray-300 truncate">
                      {item.displayName}
                    </span>
                    <span className="flex-shrink-0 text-gray-500 dark:text-gray-400 font-medium">
                      {formatDuration(item.productiveTimeMs)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
