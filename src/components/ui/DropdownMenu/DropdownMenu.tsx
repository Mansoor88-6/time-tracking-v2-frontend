"use client";

import * as React from "react";
import { cn } from "@/utils/tw";

// Types
interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(
  null
);

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("useDropdownMenu must be used within a DropdownMenu");
  }
  return context;
};

// Main DropdownMenu Component (following Radix UI patterns)
interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dir?: Direction;
  modal?: boolean;
}

function DropdownMenu({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  dir = "ltr",
  modal = true, // eslint-disable-line @typescript-eslint/no-unused-vars
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Use controlled or uncontrolled state
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : isOpen;

  const handleSetIsOpen = React.useCallback(
    (open: boolean) => {
      if (!isControlled) {
        setIsOpen(open);
      }
      onOpenChange?.(open);
    },
    [isControlled, onOpenChange]
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        currentOpen &&
        contentRef.current &&
        triggerRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleSetIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && currentOpen) {
        handleSetIsOpen(false);
      }
    };

    if (currentOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [currentOpen, handleSetIsOpen]);

  return (
    <DropdownMenuContext.Provider
      value={{
        isOpen: currentOpen,
        setIsOpen: handleSetIsOpen,
        triggerRef,
        contentRef,
      }}
    >
      <div className="relative block" dir={dir}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

// DropdownMenuTrigger Component (following Radix UI patterns)
interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ className, children, asChild = false, onClick, ...props }, ref) => {
  const { isOpen, setIsOpen, triggerRef } = useDropdownMenu();

  // Combine forwarded ref with internal ref
  const combinedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref, triggerRef]
  );

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setIsOpen(!isOpen);
      onClick?.(event);
    },
    [isOpen, setIsOpen, onClick]
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref: combinedRef,
      onClick: handleClick,
      "aria-expanded": isOpen,
      "aria-haspopup": "menu",
    } as React.HTMLAttributes<HTMLElement> & {
      ref: (node: HTMLButtonElement | null) => void;
      onClick: (event: React.MouseEvent<HTMLElement>) => void;
      "aria-expanded": boolean;
      "aria-haspopup": string;
    });
  }

  return (
    <button
      ref={combinedRef}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white dark:ring-offset-gray-800",
        className
      )}
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      {...props}
    >
      {children}
    </button>
  );
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// Types for positioning and direction (following Radix UI patterns)
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
type Variant = "default" | "destructive";
type Direction = "ltr" | "rtl";

// DropdownMenuContent Component (following Radix UI patterns)
interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side;
  align?: Align;
  sideOffset?: number;
  alignOffset?: number;
  forceMount?: boolean;
}

interface Position {
  top: number;
  left: number;
}

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(
  (
    {
      className,
      side = "bottom",
      align = "center",
      sideOffset = 4,
      alignOffset = 0,
      forceMount = false,
      children,
      ...props
    },
    ref
  ) => {
    const { isOpen, contentRef, triggerRef } = useDropdownMenu();
    const [position, setPosition] = React.useState<Position>({
      top: 0,
      left: 0,
    });
    const [isPositioned, setIsPositioned] = React.useState<boolean>(false);
    const [actualSide, setActualSide] = React.useState<Side>(side);

    // Combine forwarded ref with internal ref
    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref, contentRef]
    );

    // Calculate position immediately when opening
    React.useEffect(() => {
      if (isOpen && triggerRef.current) {
        // Use requestAnimationFrame to ensure DOM is ready
        const calculatePosition = (): void => {
          const triggerElement = triggerRef.current;
          if (!triggerElement) return;

          const triggerRect = triggerElement.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Estimate content dimensions (we'll refine after render)
          const estimatedWidth = 200; // Default width
          const estimatedHeight = 100; // Default height

          // Auto-positioning logic
          const getBestPosition = (
            preferredSide: Side
          ): { side: Side; top: number; left: number } => {
            const space = {
              top: triggerRect.top - estimatedHeight - sideOffset,
              bottom: triggerRect.bottom + sideOffset,
              left: triggerRect.left - estimatedWidth - sideOffset,
              right: triggerRect.right + sideOffset,
            };

            const fits = {
              top: space.top >= 8,
              bottom: space.bottom + estimatedHeight <= viewportHeight - 8,
              left: space.left >= 8,
              right: space.right + estimatedWidth <= viewportWidth - 8,
            };

            // Try preferred side first
            if (preferredSide === "bottom" && fits.bottom) {
              return { side: "bottom", top: space.bottom, left: 0 };
            }
            if (preferredSide === "top" && fits.top) {
              return { side: "top", top: space.top, left: 0 };
            }
            if (preferredSide === "right" && fits.right) {
              return { side: "right", top: 0, left: space.right };
            }
            if (preferredSide === "left" && fits.left) {
              return { side: "left", top: 0, left: space.left };
            }

            // Auto-select best available position
            if (fits.bottom)
              return { side: "bottom", top: space.bottom, left: 0 };
            if (fits.top) return { side: "top", top: space.top, left: 0 };
            if (fits.right) return { side: "right", top: 0, left: space.right };
            if (fits.left) return { side: "left", top: 0, left: space.left };

            // Fallback to bottom with viewport constraints
            return { side: "bottom", top: space.bottom, left: 0 };
          };

          const {
            side: calculatedSide,
            top: baseTop,
            left: baseLeft,
          } = getBestPosition(side);
          setActualSide(calculatedSide);

          let top = baseTop;
          let left = baseLeft;

          // Calculate alignment based on actual side
          switch (align) {
            case "start":
              if (calculatedSide === "bottom" || calculatedSide === "top") {
                left = triggerRect.left + alignOffset;
              } else {
                top = triggerRect.top + alignOffset;
              }
              break;
            case "center":
              if (calculatedSide === "bottom" || calculatedSide === "top") {
                left =
                  triggerRect.left +
                  (triggerRect.width - estimatedWidth) / 2 +
                  alignOffset;
              } else {
                top =
                  triggerRect.top +
                  (triggerRect.height - estimatedHeight) / 2 +
                  alignOffset;
              }
              break;
            case "end":
              if (calculatedSide === "bottom" || calculatedSide === "top") {
                left = triggerRect.right - estimatedWidth + alignOffset;
              } else {
                top = triggerRect.bottom - estimatedHeight + alignOffset;
              }
              break;
          }

          // Ensure content stays within viewport
          if (left < 0) left = 8;
          if (left + estimatedWidth > viewportWidth)
            left = viewportWidth - estimatedWidth - 8;
          if (top < 0) top = 8;
          if (top + estimatedHeight > viewportHeight)
            top = viewportHeight - estimatedHeight - 8;

          setPosition({ top, left });
          setIsPositioned(true);
        };

        requestAnimationFrame(calculatePosition);
      } else {
        setIsPositioned(false);
      }
    }, [isOpen, side, align, sideOffset, alignOffset, triggerRef]);

    // Refine position after content is rendered
    React.useEffect(() => {
      if (isOpen && isPositioned && contentRef.current && triggerRef.current) {
        const refinePosition = (): void => {
          const contentElement = contentRef.current;
          const triggerElement = triggerRef.current;
          if (!contentElement || !triggerElement) return;

          const triggerRect = triggerElement.getBoundingClientRect();
          const contentRect = contentElement.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Auto-positioning logic with actual dimensions
          const getBestPosition = (
            preferredSide: Side
          ): { side: Side; top: number; left: number } => {
            const space = {
              top: triggerRect.top - contentRect.height - sideOffset,
              bottom: triggerRect.bottom + sideOffset,
              left: triggerRect.left - contentRect.width - sideOffset,
              right: triggerRect.right + sideOffset,
            };

            const fits = {
              top: space.top >= 8,
              bottom: space.bottom + contentRect.height <= viewportHeight - 8,
              left: space.left >= 8,
              right: space.right + contentRect.width <= viewportWidth - 8,
            };

            // Try preferred side first
            if (preferredSide === "bottom" && fits.bottom) {
              return { side: "bottom", top: space.bottom, left: 0 };
            }
            if (preferredSide === "top" && fits.top) {
              return { side: "top", top: space.top, left: 0 };
            }
            if (preferredSide === "right" && fits.right) {
              return { side: "right", top: 0, left: space.right };
            }
            if (preferredSide === "left" && fits.left) {
              return { side: "left", top: 0, left: space.left };
            }

            // Auto-select best available position
            if (fits.bottom)
              return { side: "bottom", top: space.bottom, left: 0 };
            if (fits.top) return { side: "top", top: space.top, left: 0 };
            if (fits.right) return { side: "right", top: 0, left: space.right };
            if (fits.left) return { side: "left", top: 0, left: space.left };

            // Fallback to bottom with viewport constraints
            return { side: "bottom", top: space.bottom, left: 0 };
          };

          const {
            side: calculatedSide,
            top: baseTop,
            left: baseLeft,
          } = getBestPosition(side);
          setActualSide(calculatedSide);

          let top = baseTop;
          let left = baseLeft;

          // Calculate alignment based on actual side
          switch (align) {
            case "start":
              if (calculatedSide === "bottom" || calculatedSide === "top") {
                left = triggerRect.left + alignOffset;
              } else {
                top = triggerRect.top + alignOffset;
              }
              break;
            case "center":
              if (calculatedSide === "bottom" || calculatedSide === "top") {
                left =
                  triggerRect.left +
                  (triggerRect.width - contentRect.width) / 2 +
                  alignOffset;
              } else {
                top =
                  triggerRect.top +
                  (triggerRect.height - contentRect.height) / 2 +
                  alignOffset;
              }
              break;
            case "end":
              if (calculatedSide === "bottom" || calculatedSide === "top") {
                left = triggerRect.right - contentRect.width + alignOffset;
              } else {
                top = triggerRect.bottom - contentRect.height + alignOffset;
              }
              break;
          }

          // Ensure content stays within viewport
          if (left < 0) left = 8;
          if (left + contentRect.width > viewportWidth)
            left = viewportWidth - contentRect.width - 8;
          if (top < 0) top = 8;
          if (top + contentRect.height > viewportHeight)
            top = viewportHeight - contentRect.height - 8;

          setPosition({ top, left });
        };

        requestAnimationFrame(refinePosition);
      }
    }, [
      isPositioned,
      side,
      align,
      sideOffset,
      alignOffset,
      position.top,
      position.left,
      contentRef,
      isOpen,
      triggerRef,
    ]);

    if (!isOpen && !forceMount) return null;

    return (
      <div
        ref={combinedRef}
        className={cn(
          "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-1 text-gray-900 dark:text-gray-100 shadow-md",
          "transition-all duration-200 ease-in-out",
          className
        )}
        style={{
          top: position.top,
          left: position.left,
          transition: isPositioned ? "none" : "opacity 0.1s ease-out",
          display: !isOpen && forceMount ? "none" : undefined,
        }}
        data-state={isOpen ? "open" : "closed"}
        data-side={actualSide}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuContent.displayName = "DropdownMenuContent";

// DropdownMenuItem Component (following Radix UI patterns)
interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  variant?: Variant;
  disabled?: boolean;
}

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(
  (
    {
      className,
      inset = false,
      variant = "default",
      disabled = false,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const { setIsOpen } = useDropdownMenu();

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        onClick?.(event);
        setIsOpen(false);
      },
      [disabled, onClick, setIsOpen]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          "text-gray-900 dark:text-gray-100",
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
          "focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100",
          "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
          variant === "destructive" &&
            "text-red-600 dark:text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-900/20 dark:focus:text-red-400",
          inset && "pl-8",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleClick}
        data-disabled={disabled}
        data-variant={variant}
        data-inset={inset}
        tabIndex={disabled ? -1 : 0}
        role="menuitem"
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuItem.displayName = "DropdownMenuItem";

// DropdownMenuCheckboxItem Component (following Radix UI patterns)
interface DropdownMenuCheckboxItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(
  (
    {
      className,
      checked = false,
      onCheckedChange,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    useDropdownMenu(); // Get context but don't use setIsOpen

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        onCheckedChange?.(!checked);
        event.stopPropagation();
      },
      [disabled, onCheckedChange, checked]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none transition-colors",
          "text-gray-900 dark:text-gray-100",
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
          "focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100",
          "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleClick}
        data-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        role="menuitemcheckbox"
        aria-checked={checked}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </span>
        {children}
      </div>
    );
  }
);

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

// DropdownMenuRadioItem Component (following Radix UI patterns)
interface DropdownMenuRadioItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
  checked?: boolean;
  onSelect?: (value: string) => void;
  disabled?: boolean;
}

const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuRadioItemProps
>(
  (
    {
      className,
      value,
      checked = false,
      onSelect,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    useDropdownMenu(); // Get context but don't use setIsOpen

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        onSelect?.(value);
        event.stopPropagation();
      },
      [disabled, onSelect, value]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none transition-colors",
          "text-gray-900 dark:text-gray-100",
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
          "focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100",
          "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleClick}
        data-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        role="menuitemradio"
        aria-checked={checked}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <div className="h-2 w-2 rounded-full bg-current" />}
        </span>
        {children}
      </div>
    );
  }
);

DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

// DropdownMenuLabel Component (following Radix UI patterns)
interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  DropdownMenuLabelProps
>(({ className, inset = false, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

DropdownMenuLabel.displayName = "DropdownMenuLabel";

// DropdownMenuSeparator Component (following Radix UI patterns)
type DropdownMenuSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("my-1 h-px bg-gray-200 dark:bg-gray-700 -mx-1", className)}
      {...props}
    />
  );
});

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

// DropdownMenuShortcut Component (following Radix UI patterns)
type DropdownMenuShortcutProps = React.HTMLAttributes<HTMLSpanElement>;

const DropdownMenuShortcut = React.forwardRef<
  HTMLSpanElement,
  DropdownMenuShortcutProps
>(({ className, children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "ml-auto text-xs tracking-widest text-gray-500 dark:text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// DropdownMenuGroup Component (following Radix UI patterns)
type DropdownMenuGroupProps = React.HTMLAttributes<HTMLDivElement>;

const DropdownMenuGroup = React.forwardRef<
  HTMLDivElement,
  DropdownMenuGroupProps
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("", className)} role="group" {...props}>
      {children}
    </div>
  );
});

DropdownMenuGroup.displayName = "DropdownMenuGroup";

// DropdownMenuSub Components (following Radix UI patterns)
interface DropdownMenuSubProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  return <>{children}</>;
}

interface DropdownMenuSubTriggerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSubTriggerProps
>(({ className, inset = false, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "text-gray-900 dark:text-gray-100",
        "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        "focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <svg
        className="ml-auto h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  );
});

DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

interface DropdownMenuSubContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side;
  align?: Align;
  sideOffset?: number;
  alignOffset?: number;
  forceMount?: boolean;
}

const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSubContentProps
>(
  (
    {
      className,
      side = "right", // eslint-disable-line @typescript-eslint/no-unused-vars
      align = "start", // eslint-disable-line @typescript-eslint/no-unused-vars
      sideOffset = 4, // eslint-disable-line @typescript-eslint/no-unused-vars
      alignOffset = 0, // eslint-disable-line @typescript-eslint/no-unused-vars
      forceMount = false, // eslint-disable-line @typescript-eslint/no-unused-vars
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-1 text-gray-900 dark:text-gray-100 shadow-lg",
          "transition-all duration-300 ease-in-out",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

// Export all components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
