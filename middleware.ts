import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const path = req.nextUrl.pathname;
    const searchParams = req.nextUrl.searchParams;
    const success = searchParams.get('success');
    
    // Always allow dashboard routes with success parameter
    if (success === 'true' && (path === '/dashboard' || path.startsWith('/dashboard/'))) {
      console.log('Success parameter detected, bypassing auth check');
      return res;
    }
    
    // Only protect dashboard routes
    if (path === '/dashboard' || path.startsWith('/dashboard/')) {
      if (!session) {
        console.log('No session detected, redirecting to signin');
        // Redirect unauthenticated users to signin
        // Use a 303 See Other redirect to ensure proper history management
        return NextResponse.redirect(new URL('/signin', req.url), { status: 303 });
      }
    }
    
    // For all other routes, just continue
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, allow the request to continue
    return res;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}; 