import { NextRequest, NextResponse } from 'next/server';

/**
 * Shared logout handler used by both GET and POST.
 *
 * GET  /api/logout — triggered by top-level window.location.href navigation.
 *                    The browser follows the 302 → /login as a real page
 *                    navigation and correctly applies all Set-Cookie headers.
 *
 * POST /api/logout — kept for programmatic use (e.g., from api.ts on 401).
 *
 * Why top-level navigation works but fetch() doesn't:
 * When fetch() follows a 302 internally, browsers do NOT apply Set-Cookie
 * headers from the intermediate redirect response to the document cookie jar
 * (they only apply to the final response). So a fetch-then-redirect approach
 * leaves the token cookie alive and the middleware bounces the user back.
 * A real browser navigation through window.location.href processes every
 * hop in the redirect chain correctly.
 */
async function handleLogout(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Best-effort: revoke the refresh token on the backend auth-service
  if (refreshToken) {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/auth/logout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }
      );
    } catch {
      // Proceed regardless — logging out locally is always safe
    }
  }

  // Redirect to login page
  const response = NextResponse.redirect(new URL('/login', request.url));

  // Clear all auth cookies by expiring them
  const cookieOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set('token', '', cookieOptions);
  response.cookies.set('refreshToken', '', cookieOptions);
  response.cookies.set('role', '', cookieOptions);

  return response;
}

// GET: triggered by window.location.href = '/api/logout' (top-level navigation)
export async function GET(request: NextRequest) {
  return handleLogout(request);
}

// POST: kept for programmatic / API use
export async function POST(request: NextRequest) {
  return handleLogout(request);
}
