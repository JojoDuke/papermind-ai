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

  // Extract the host from the current request
  const origin = "usepapermind.com"
  
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
    
    // Handle redirectUrl - if it's a relative path, prepend the origin
    if (redirectUrl && !redirectUrl.startsWith('http')) {
      return NextResponse.redirect(`${origin}${redirectUrl.startsWith('/') ? '' : '/'}${redirectUrl}`);
    }
    
    // Otherwise use the dashboard with success parameter
    return NextResponse.redirect(`${origin}/dashboard?success=true`);
  }

  // For normal auth flow, redirect to profile page to handle user creation
  console.log('Normal auth flow, redirecting to profile');
  return NextResponse.redirect(`${origin}/profile`);
} 