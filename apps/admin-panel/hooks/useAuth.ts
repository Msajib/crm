'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface AuthState {
  role: string | null;
  isAuthenticated: boolean;
}

/**
 * useAuth - Shared authentication hook.
 *
 * Centralizes all auth logic so that Sidebar, UserNav, and any future
 * component have a single, consistent logout implementation.
 *
 * The `logout` function POSTs to our own Next.js API route (/api/logout)
 * which runs on the server and deletes the auth cookies via Set-Cookie
 * headers. This is the ONLY reliable way to clear cookies that the
 * Next.js middleware reads — client-side document.cookie manipulation
 * cannot guarantee the server will see them as deleted on the next request.
 */
export function useAuth(): AuthState & { logout: () => Promise<void> } {
  const [authState, setAuthState] = useState<AuthState>({
    role: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Read role from localStorage for display purposes (set at login time).
    // The actual session validity is determined by the 'token' cookie read
    // server-side by middleware.ts.
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    setAuthState({
      role: role,
      isAuthenticated: !!token,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear localStorage immediately so UI updates
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('refreshToken');

      /**
       * CRITICAL: Use a top-level navigation to the logout API route,
       * NOT fetch() + then redirect manually.
       *
       * Why: fetch() follows 302 redirects internally. When it does,
       * the browser does NOT apply Set-Cookie headers from the intermediate
       * redirect response to the document's cookie jar. So the token cookie
       * stays alive and middleware bounces the user back to /dashboard.
       *
       * With window.location.href, the browser handles the full
       * 302 redirect chain as a real page navigation, correctly applying
       * all Set-Cookie headers before landing on /login.
       */
      window.location.href = '/api/logout';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force-clear cookies client-side and redirect
      document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
      document.cookie = 'role=; path=/; max-age=0; SameSite=Strict';
      document.cookie = 'refreshToken=; path=/; max-age=0; SameSite=Strict';
      window.location.href = '/login';
    }
  }, []);

  return { ...authState, logout };
}
