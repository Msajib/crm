import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add public routes here
const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
const apiAuthPrefix = '/api/auth';

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  
  // Exclude static assets and next internals
  if (
    nextUrl.pathname.startsWith('/_next') ||
    nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // Allow API auth routes to proceed (login, register)
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from public routes (like login)
  if (isPublicRoute) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
}

// Ensure the middleware runs on relevant paths
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
