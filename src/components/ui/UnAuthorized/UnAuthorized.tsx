import React from "react";
import Link from "next/link";
import { HiExclamationTriangle } from "react-icons/hi2";
import { HiHome } from "react-icons/hi2";

const UnAuthorized = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-50">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <HiExclamationTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          You don&apos;t have permission to access this resource. Please contact
          your administrator if you believe this is an error.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 font-medium"
          >
            <HiHome className="w-5 h-5 mr-2" />
            Go Home
          </Link>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Error Code: 403
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnAuthorized;
