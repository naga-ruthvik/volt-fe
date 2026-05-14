/**
 * Authentication service for Volt.
 * Handles OTP-only authentication flow:
 *   POST /otp/generate/     → sends OTP
 *   POST /otp/verify/       → verifies OTP, returns access_token (refresh in HttpOnly cookie)
 *   POST /profile/complete/ → sets username for new users
 *   POST /logout/           → invalidates session
 *   POST /refresh/          → refreshes access token (refresh token sent via cookie automatically)
 */

import { API_BASE } from './config';

// ── Types ────────────────────────────────────────────────────────────────

export interface GenerateOtpResponse {
  success: boolean;
  is_new_user?: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  access?: string;
  refresh?: string;
  is_new_user?: boolean;
  username?: string;
  email?: string;
  message?: string;
  /** Raw API response for debugging */
  _raw?: any;
}

export interface ProfileCompleteResponse {
  success: boolean;
  username?: string;
  message?: string;
}

export interface AuthUser {
  email: string;
  username: string;
  isNewUser: boolean;
}

// ── Token helpers ────────────────────────────────────────────────────────

const TOKEN_KEY = 'volt_access_token';
const USER_KEY = 'volt_user';

export function storeAccessToken(access: string): void {
  localStorage.setItem(TOKEN_KEY, access);
}

/** @deprecated Use storeAccessToken — refresh token is in HttpOnly cookie */
export function storeTokens(access: string, _refresh?: string): void {
  localStorage.setItem(TOKEN_KEY, access);
}

export function storeUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Decode a JWT payload without a library.
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Check if the stored access token exists and has not expired.
 * Adds a 30-second buffer so we refresh before actual expiry.
 */
export function isTokenValid(): boolean {
  const token = getAccessToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true; // no exp claim — assume valid

  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp > nowSec + 30; // 30s buffer
}

/**
 * Quick check: do we have a stored access token?
 * Use isTokenValid() for expiry-aware checks.
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Try to restore a valid session on page load.
 * 1. If access token exists and is valid → authenticated
 * 2. If access token is missing/expired → try /refresh/ (cookie-based)
 * 3. If refresh fails → not authenticated
 */
export async function tryAutoAuth(): Promise<boolean> {
  // Case 1: valid access token in storage
  if (isTokenValid()) return true;

  // Case 2: try refreshing via HttpOnly cookie
  const refreshed = await refreshAccessToken();
  return refreshed;
}

// ── Authenticated fetch helper ───────────────────────────────────────────

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // If token is locally known to be expired/invalid, try refreshing preemptively
  if (!isTokenValid() && getAccessToken()) {
    await refreshAccessToken();
  }

  let token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  let response = await fetch(url, { ...options, headers, credentials: 'include' });

  // If we get a 401, the token might have expired on the server. Try to refresh once.
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      token = getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      response = await fetch(url, { ...options, headers, credentials: 'include' });
    }
  }

  return response;
}

// ── API calls ────────────────────────────────────────────────────────────

/**
 * POST /otp/generate/
 * Sends an OTP to the provided email.
 */
export async function generateOtp(email: string): Promise<GenerateOtpResponse> {
  try {
    const res = await fetch(`${API_BASE}/otp/generate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.detail || data.message || data.error || 'Failed to send OTP',
      };
    }
    return {
      success: true,
      is_new_user: data.is_new_user ?? false,
      message: data.message || 'OTP sent successfully',
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error. Please try again.' };
  }
}

/**
 * POST /otp/verify/
 * Verifies OTP. Returns { access_token, user, registration_incomplete }.
 * Refresh token is set as HttpOnly cookie by the backend.
 */
export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  try {
    const res = await fetch(`${API_BASE}/otp/verify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // receive the refresh cookie
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    console.log('[Volt Auth] /otp/verify/ response:', data);

    if (!res.ok) {
      return {
        success: false,
        message: data.detail || data.message || data.error || 'Invalid OTP',
      };
    }

    // Extract token — API returns { access_token: "..." }
    const access = data.access_token || data.access || data.token || '';

    // registration_incomplete: true → new user, false → existing user
    const isNew = data.registration_incomplete ?? false;

    return {
      success: true,
      access,
      is_new_user: isNew,
      username: data.user?.username || data.username || '',
      email: data.user?.email || data.email || email,
      _raw: data,
    };
  } catch (err: any) {
    console.error('[Volt Auth] /otp/verify/ error:', err);
    return { success: false, message: err.message || 'Network error. Please try again.' };
  }
}

/**
 * POST /profile/complete/
 * Sets username for new users. Requires JWT auth.
 */
export async function completeProfile(username: string): Promise<ProfileCompleteResponse> {
  try {
    const res = await authFetch(`${API_BASE}/profile/complete/`, {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.detail || data.message || data.error || 'Failed to set username',
      };
    }
    return {
      success: true,
      username: data.username || username,
      message: data.message || 'Profile completed',
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error. Please try again.' };
  }
}

/**
 * POST /logout/
 * Invalidates the current session.
 * Backend clears the HttpOnly refresh cookie.
 */
export async function logout(): Promise<void> {
  try {
    await authFetch(`${API_BASE}/logout/`, {
      method: 'POST',
    });
  } catch {
    // Silent fail — we clear local state regardless
  } finally {
    clearAuth();
  }
}

/**
 * POST /refresh/
 * Refreshes the access token using the HttpOnly refresh cookie.
 * The browser sends the cookie automatically — no body needed.
 */
let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // sends the HttpOnly refresh cookie
      });
      if (!res.ok) {
        clearAuth();
        return false;
      }
      const data = await res.json();
      const newAccess = data.access_token || data.access || '';
      if (newAccess) {
        storeAccessToken(newAccess);
        return true;
      }
      return false;
    } catch {
      clearAuth();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
