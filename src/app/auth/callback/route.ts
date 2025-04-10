import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const success = searchParams.get('success')
  const redirectUrl = searchParams.get('redirectUrl')

  if (code) {
    // Exchange the auth code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Check if there's a ?payment=success or similar in the URL
  const hasPaymentSuccess = searchParams.toString().includes('payment') && 
                          searchParams.toString().includes('success');

  // If there's a success parameter or a specific redirectUrl, honor it
  // This prevents redirecting users away from the dashboard after payment/subscription
  if (success === 'true' || redirectUrl || hasPaymentSuccess) {
    console.log('Success parameter or redirectUrl detected, redirecting to dashboard');
    // If the URL has payment success indicators, make sure we add the success parameter
    if (hasPaymentSuccess && !success) {
      return NextResponse.redirect(new URL('/dashboard?success=true', req.url));
    }
    return NextResponse.redirect(new URL(redirectUrl || '/dashboard?success=true', req.url));
  }

  // For normal auth flow, redirect to profile page to handle user creation
  console.log('Normal auth flow, redirecting to profile');
  return NextResponse.redirect(new URL('/profile', req.url));
} 