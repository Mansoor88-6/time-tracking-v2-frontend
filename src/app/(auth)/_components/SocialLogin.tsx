"use client";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { SiFacebook } from "react-icons/si";
import { ImSpinner2 } from "react-icons/im";

const SocialLogin = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState({ google: false, facebook: false });

  const handleGoogleLogin = () => {
    if (typeof window !== "undefined") {
      setLoading((prev) => ({ ...prev, google: true }));
      window.location.href = `${BASE_URL}/auth/google`;
    }
  };

  const handleFacebookLogin = () => {
    if (typeof window !== "undefined") {
      setLoading((prev) => ({ ...prev, facebook: true }));
      window.location.href = `${BASE_URL}/auth/facebook`;
    }
  };

  return (
    <div className="mt-5">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <button
            onClick={handleGoogleLogin}
            disabled={loading.google} // Disables the button while loading
            className={`w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-sm shadow-sm text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 ${
              loading.google ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {loading.google ? (
              <ImSpinner2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <FcGoogle className="h-5 w-5 mr-2" />
                <span>GOOGLE</span>
              </>
            )}
          </button>
        </div>

        <div>
          <button
            onClick={handleFacebookLogin}
            disabled={loading.facebook} // Disables the button while loading
            className={`w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-sm shadow-sm text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 ${
              loading.facebook ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {loading.facebook ? (
              <ImSpinner2 className="h-5 w-5 animate-spin " />
            ) : (
              <>
                <SiFacebook className="h-5 w-5 mr-2 text-blue-500" />
                <span>FACEBOOK</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialLogin;
