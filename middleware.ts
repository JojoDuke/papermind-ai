import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const path = req.nextUrl.pathname;
    
    // Protected routes
    const protectedRoutes = ['/dashboard'];
    const isProtectedRoute = protectedRoutes.some(route => 
      path === route || path.startsWith(`${route}/`)
    );
    
    // Auth routes
    const authRoutes = ['/signin', '/signup'];
    const isAuthRoute = authRoutes.includes(path);
    
    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }
    
    // Redirect authenticated users from auth routes
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }
  
  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/signin',
    '/signup',
  ],
}; 