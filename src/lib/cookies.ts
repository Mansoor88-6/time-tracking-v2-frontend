// lib/cookies.ts
// Cookie utility for secure token storage

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Get cookie configuration based on environment
const getCookieOptions = (): {
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  path: string;
} => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    secure: isProduction, // Only use Secure flag in production (HTTPS)
    sameSite: "strict", // CSRF protection
    path: "/",
  };
};

/**
 * Set a cookie with secure defaults
 */
export const setCookie = (
  name: string,
  value: string,
  daysToExpire: number = 7
): void => {
  if (!isBrowser) return;

  const options = getCookieOptions();
  const expires = new Date();
  expires.setTime(expires.getTime() + daysToExpire * 24 * 60 * 60 * 1000);

  let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=${options.path}; SameSite=${options.sameSite}`;

  if (options.secure) {
    cookieString += "; Secure";
  }

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (!isBrowser) return null;

  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Remove a cookie
 */
export const removeCookie = (name: string): void => {
  if (!isBrowser) return;

  const options = getCookieOptions();
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${options.path}; SameSite=${options.sameSite}${options.secure ? "; Secure" : ""}`;
};

/**
 * Get access token from cookie
 */
export const getAccessToken = (): string | null => {
  return getCookie(ACCESS_TOKEN_COOKIE);
};

/**
 * Get refresh token from cookie
 */
export const getRefreshToken = (): string | null => {
  return getCookie(REFRESH_TOKEN_COOKIE);
};

/**
 * Set both access and refresh tokens in cookies
 */
export const setTokens = (
  accessToken: string,
  refreshToken?: string,
  accessTokenExpiryDays: number = 1, // Access tokens typically expire in 1 day or less
  refreshTokenExpiryDays: number = 7 // Refresh tokens typically expire in 7 days
): void => {
  setCookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenExpiryDays);
  if (refreshToken) {
    setCookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenExpiryDays);
  }
};

/**
 * Clear both access and refresh tokens from cookies
 */
export const clearTokens = (): void => {
  removeCookie(ACCESS_TOKEN_COOKIE);
  removeCookie(REFRESH_TOKEN_COOKIE);
};

/**
 * Check if tokens exist in cookies
 */
export const hasTokens = (): boolean => {
  return !!(getAccessToken() || getRefreshToken());
};
