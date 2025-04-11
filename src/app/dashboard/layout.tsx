'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/dashboard/sidebar";
import { FileProvider } from "@/contexts/FileContext";
import { useCredits } from "@/contexts/CreditsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const { refreshCredits } = useCredits();

  useEffect(() => {
    // If success parameter is present, refresh premium status and credits
    if (success === 'true') {
      console.log('Dashboard Layout: Success parameter detected, refreshing premium status');
      const refreshUserStatus = async () => {
        try {
          // Force refresh the credits and premium status
          await refreshCredits();
          
          // Remove the success parameter after processing to avoid repeated refreshes
          const url = new URL(window.location.href);
          url.searchParams.delete('success');
          window.history.replaceState({}, '', url);
        } catch (error) {
          console.error('Error refreshing user status:', error);
        }
      };
      
      refreshUserStatus();
      return;
    }

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          console.log('Dashboard: No session found, redirecting to signin');
          router.push('/signin');
          return;
        }
        
        console.log('Dashboard: User authenticated, showing content');
      } catch (error) {
        console.error('Dashboard: Error checking authentication:', error);
        router.push('/signin');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip redirect if success parameter is present
      if (success === 'true') {
        console.log('Dashboard Layout: Success parameter detected, ignoring auth change');
        return;
      }
      
      console.log('Dashboard: Auth state changed:', event, session ? 'Session exists' : 'No session');
      if (!session) {
        router.push('/signin');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, success, refreshCredits]);

  return (
    <FileProvider>
      <div className="relative h-screen">
        <Sidebar />
        {children}
      </div>
    </FileProvider>
  );
} 