'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Loading from '@/components/ui/loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('Dashboard layout mounted');
    
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        console.log('Dashboard: Checking authentication...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('Dashboard: No session found, redirecting to signin');
          window.location.href = '/signin';
          return;
        }
        
        console.log('Dashboard: User authenticated, showing content');
        setIsAuthenticated(true);
        setIsLoading(false);
        
        // Replace current history entry with the dashboard page
        // This ensures clicking back will go to the homepage
        window.history.replaceState(null, '', '/dashboard');
      } catch (error) {
        console.error('Dashboard: Error checking authentication:', error);
        window.location.href = '/signin';
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Dashboard: Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      if (event === 'SIGNED_OUT') {
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

  if (isLoading) {
    return <Loading />;
  }

  return isAuthenticated ? (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  ) : null;
} 