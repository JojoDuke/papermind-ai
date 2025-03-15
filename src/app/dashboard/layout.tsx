'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
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
      console.log('Dashboard: Auth state changed:', event, session ? 'Session exists' : 'No session');
      if (!session) {
        router.push('/signin');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="relative h-screen">
      <Sidebar />
      {children}
    </div>
  );
} 