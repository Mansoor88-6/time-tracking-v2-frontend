// Import global styles and fonts
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { HiExclamationCircle, HiHome } from "react-icons/hi";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-50">
          <div className="text-center max-w-md mx-auto px-6">
            {/* Icon */}
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <HiExclamationCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Page Not Found
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved. Please check the URL or go back to the homepage.
            </p>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 font-medium"
                >
                  <HiHome className="w-5 h-5 mr-2" />
                  Go Home
                </Link>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Error Code: 404
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
