import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  console.log('Auth callback: Processing code exchange')
  console.log('Auth callback: Redirect destination:', redirectTo)

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback: Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/signin?error=auth_error', req.url), { status: 303 })
      }
      
      console.log('Auth callback: Session established successfully')
    } catch (err) {
      console.error('Auth callback: Exception during code exchange:', err)
      return NextResponse.redirect(new URL('/signin?error=auth_exception', req.url), { status: 303 })
    }
  } else {
    console.log('Auth callback: No code provided')
  }

  // URL to redirect to after sign in process completes
  // Use 303 See Other to ensure a GET request and proper history management
  console.log('Auth callback: Redirecting to:', redirectTo)
  return NextResponse.redirect(new URL(redirectTo, req.url), { status: 303 });
} 