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
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname) || nextUrl.pathname.startsWith('/subscribe');
  
  // Get token and role from cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value?.toUpperCase();
  const permissionsStr = request.cookies.get('permissions')?.value;
  let permissions: string[] = [];
  try {
    if (permissionsStr) permissions = JSON.parse(decodeURIComponent(permissionsStr));
  } catch (e) {}

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

  // Enforce Permissions for Staff
  if (token && role === 'STAFF') {
    const pathPermissions: Record<string, string> = {
      '/dashboard/ai': 'ai:view',
      '/contacts': 'contacts:read',
      '/leads': 'leads:read',
      '/deals': 'deals:read',
      '/tasks': 'tasks:read',
      '/dashboard/communication': 'communications:view',
      '/dashboard/marketing': 'marketing:view',
      '/dashboard/settings/branding': 'settings:branding',
      '/dashboard/settings/users': 'settings:users',
      '/dashboard/settings/payments': 'payments:view',
      '/dashboard/settings/subscription': 'payments:view',
    };

    // Find if the current path (or parent path) requires a permission
    const requiredPermission = Object.entries(pathPermissions).find(([path]) => 
      nextUrl.pathname.startsWith(path)
    )?.[1];

    if (requiredPermission && !permissions.includes(requiredPermission)) {
      console.warn(`Unauthorized access attempt by staff to ${nextUrl.pathname}. Required: ${requiredPermission}`);
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
}

// Ensure the middleware runs on relevant paths
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
