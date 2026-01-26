"use client";
import { forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { twMerge } from "tailwind-merge";

interface CustomLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  underline?: "none" | "hover" | "always";
  color?: "default" | "primary" | "secondary" | "inherit";
  target?: string;
  rel?: string;
}

export const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  (
    {
      children,
      className,
      underline = "hover",
      color = "default",
      target,
      rel,
      ...props
    },
    ref
  ) => {
    const baseStyles = "transition-all duration-200";
    const underlineStyles =
      underline === "none"
        ? "no-underline"
        : underline === "hover"
        ? "hover:underline"
        : "underline";
    const colorStyles = {
      default: " text-gray-700 dark:text-gray-300 hover:text-gray-500",
      primary: "text-blue-500 hover:text-blue-600 ",
      secondary: "text-red-500 hover:text-red-600",
      inherit: "inherit",
    };

    const isExternal = target === "_blank";

    // Use twMerge correctly to concatenate all styles
    const mergedClassName = twMerge(
      baseStyles,
      underlineStyles,
      colorStyles[color],
      className // Allow user-provided styles to override defaults
    );

    return (
      <Link
        {...props}
        ref={ref}
        target={target}
        rel={isExternal ? `${rel || ""} noopener noreferrer` : rel}
        className={mergedClassName}
      >
        {children}
      </Link>
    );
  }
);

CustomLink.displayName = "CustomLink";
