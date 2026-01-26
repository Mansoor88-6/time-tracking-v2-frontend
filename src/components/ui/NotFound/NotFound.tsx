import React from "react";
import { HiExclamationCircle } from "react-icons/hi2";

const ContentNotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-48 w-full p-8">
      {/* Icon */}
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <HiExclamationCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        Content Not Found
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center max-w-sm">
        The requested content could not be found. It may have been moved or
        deleted.
      </p>

      {/* Error Code */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Error Code: 404
      </div>
    </div>
  );
};

export default ContentNotFound;
