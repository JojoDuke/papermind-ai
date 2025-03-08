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

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          // Not authenticated, redirect to signin
          window.location.href = '/signin';
          return;
        }
        
        // User is authenticated, show content
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Error checking auth, redirect to signin
        window.location.href = '/signin';
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 