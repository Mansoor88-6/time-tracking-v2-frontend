import React, { useState } from "react";
import Image from "next/image";
import { BiUser } from "react-icons/bi";
import { getInitialsFromName } from "@/utils/NameLetterSeperator";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User avatar",
  name,
  size = "md",
  className = "",
  showFallback = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const shouldShowImage = src && !imageError && showFallback;
  const shouldShowInitials = !shouldShowImage && name && showFallback;
  const shouldShowIcon =
    !shouldShowImage && !shouldShowInitials && showFallback;

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        border-2 
        border-primary 
        bg-slate-200 
        dark:bg-gray-600 
        flex 
        items-center 
        justify-center 
        overflow-hidden
        relative
        ${className}
      `}
    >
      {shouldShowImage && (
        <Image
          alt={alt}
          height={
            size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : 64
          }
          width={
            size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : 64
          }
          src={src}
          unoptimized
          loader={({ src }) => src}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="object-cover rounded-full"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}

      {shouldShowInitials && (
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {getInitialsFromName(name)}
        </span>
      )}

      {shouldShowIcon && (
        <BiUser className="text-gray-500 dark:text-gray-400" />
      )}

      {/* Loading state overlay - Skeleton UI */}
      {src && !imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 animate-pulse">
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 animate-pulse rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default Avatar;
