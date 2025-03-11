'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isAuthenticated, getCurrentUser } from '@/lib/supabase';
import Loading from '@/components/ui/loading';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      try {
        console.log('PrivateRoute: Checking authentication...');
        
        // Get the current user directly
        const user = await getCurrentUser();
        console.log('PrivateRoute: User check result:', user ? 'User found' : 'No user found');
        
        if (!user) {
          console.log('PrivateRoute: No user found, redirecting to signin');
          // Use window.location for a full page navigation
          window.location.href = '/signin';
          return;
        }
        
        console.log('PrivateRoute: User authenticated, showing content');
        setIsAuthed(true);
        setIsLoading(false);
      } catch (error) {
        console.error('PrivateRoute: Error verifying authentication:', error);
        window.location.href = '/signin';
      }
    };

    checkAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('PrivateRoute: Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      if (event === 'SIGNED_IN') {
        setIsAuthed(true);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        window.location.href = '/signin';
      }
    });

    // Clean up subscription when component unmounts
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return <Loading />;
  }

  // Only render children if authenticated
  return isAuthed ? <>{children}</> : null;
} 