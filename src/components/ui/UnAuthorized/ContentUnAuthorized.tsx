import React from "react";
import { HiExclamationTriangle } from "react-icons/hi2";

const ContentUnAuthorized = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-48 w-full p-8">
      {/* Icon */}
      <div className="mb-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <HiExclamationTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        Access Denied
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center max-w-sm">
        You don&apos;t have permission to view this content. Please contact your
        administrator for access.
      </p>

      {/* Error Code */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Error Code: 403
      </div>
    </div>
  );
};

export default ContentUnAuthorized;
