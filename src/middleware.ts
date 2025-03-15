import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes require authentication
const protectedRoutes = ['/dashboard', '/dashboard/d'];
// Define routes that should be accessible even when not authenticated
const publicRoutes = ['/signin', '/signup', '/auth/callback'];

export async function middleware(req: NextRequest) {
  // Skip middleware in development to simplify debugging
  if (process.env.NODE_ENV === 'development') {
    //console.log('Middleware: Skipping in development mode');
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Get the pathname from the URL
  const path = req.nextUrl.pathname;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // Check if the current path is a public route (like signin)
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // Only check authentication for protected routes
  if (isProtectedRoute) {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session and on a protected route, redirect to signin
    if (!session) {
      console.log('Middleware: No session found, redirecting to signin');
      const redirectUrl = new URL('/signin', req.url);
      // Add the original URL as a query parameter to redirect back after login
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }
    
    console.log('Middleware: Session found, allowing access to protected route');
  }
  
  // If it's the signin page and the user is already authenticated, redirect to dashboard
  if (isPublicRoute) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('Middleware: User already authenticated, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  return res;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/auth (auth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
}; 