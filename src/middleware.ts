import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes require authentication
const protectedRoutes = ['/dashboard', '/dashboard/d'];
// Define routes that should be accessible even when not authenticated
const publicRoutes = ['/signin', '/signup', '/auth/callback'];

export async function middleware(req: NextRequest) {
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

  try {
    // Refresh session if it exists
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Middleware: Session error:', error);
    }
    
    // If no session and on a protected route, redirect to signin
    if (isProtectedRoute && !session) {
      console.log('Middleware: No session found, redirecting to signin');
      const redirectUrl = new URL('/signin', req.url);
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }
    
    // If on a public route and user is authenticated, redirect to dashboard
    if (isPublicRoute && session) {
      console.log('Middleware: User already authenticated, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // Update response headers
    return res;
  } catch (e) {
    console.error('Middleware: Error:', e);
    // On error, allow the request to continue
    return res;
  }
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